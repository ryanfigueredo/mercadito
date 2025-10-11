import { NextRequest, NextResponse } from "next/server";

// Coordenadas da loja - R. Primavera, 1246 - Sobradinho, Feira de Santana/BA
const STORE_COORDINATES = {
  lat: parseFloat(process.env.STORE_LATITUDE || "-12.2387"),
  lng: parseFloat(process.env.STORE_LONGITUDE || "-38.9753"),
  city: process.env.STORE_CITY || "Feira de Santana",
  state: process.env.STORE_STATE || "BA",
  address: process.env.STORE_ADDRESS || "R. Primavera, 1246 - Sobradinho",
  zipCode: process.env.STORE_ZIP_CODE || "44031-090",
};

// Tabela de frete por faixa de distância (em km)
const SHIPPING_RATES = [
  { maxDistance: 5, rate: 0 }, // Frete grátis até 5km
  { maxDistance: 10, rate: 800 }, // R$ 8,00 de 5km a 10km
  { maxDistance: 20, rate: 1200 }, // R$ 12,00 de 10km a 20km
  { maxDistance: 50, rate: 2000 }, // R$ 20,00 de 20km a 50km
  { maxDistance: 100, rate: 3500 }, // R$ 35,00 de 50km a 100km
  { maxDistance: 200, rate: 5000 }, // R$ 50,00 de 100km a 200km
  { maxDistance: Infinity, rate: 8000 }, // R$ 80,00 acima de 200km
];

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Função para calcular distância entre duas coordenadas (Haversine)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Função para obter coordenadas de um CEP usando API de geocoding
async function getCoordinatesFromCEP(
  cep: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Primeiro, obter dados do CEP via ViaCEP
    const viaCEPResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!viaCEPResponse.ok) {
      throw new Error("Erro ao consultar CEP");
    }

    const cepData: ViaCEPResponse = await viaCEPResponse.json();
    if (cepData.erro) {
      throw new Error("CEP não encontrado");
    }

    // Usar OpenStreetMap Nominatim para geocoding (gratuito)
    const address = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`;
    const nominatimResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1&countrycodes=br`
    );

    if (!nominatimResponse.ok) {
      throw new Error("Erro ao obter coordenadas");
    }

    const nominatimData = await nominatimResponse.json();
    if (nominatimData.length === 0) {
      throw new Error("Endereço não encontrado");
    }

    return {
      lat: parseFloat(nominatimData[0].lat),
      lng: parseFloat(nominatimData[0].lon),
    };
  } catch (error) {
    console.error("Erro ao obter coordenadas:", error);
    return null;
  }
}

// Função para calcular frete baseado na distância
function calculateShippingRate(distanceKm: number): number {
  for (const rate of SHIPPING_RATES) {
    if (distanceKm <= rate.maxDistance) {
      return rate.rate;
    }
  }
  return SHIPPING_RATES[SHIPPING_RATES.length - 1].rate;
}

export async function POST(req: NextRequest) {
  try {
    const { zipCode, city, state } = await req.json();

    if (!zipCode) {
      return NextResponse.json({ error: "CEP é obrigatório" }, { status: 400 });
    }

    // Limpar CEP (remover traços e espaços)
    const cleanZipCode = zipCode.replace(/\D/g, "");

    if (cleanZipCode.length !== 8) {
      return NextResponse.json(
        { error: "CEP deve ter 8 dígitos" },
        { status: 400 }
      );
    }

    // Obter coordenadas do CEP de destino
    const destinationCoords = await getCoordinatesFromCEP(cleanZipCode);

    if (!destinationCoords) {
      return NextResponse.json(
        { error: "Não foi possível calcular o frete para este CEP" },
        { status: 400 }
      );
    }

    // Calcular distância
    const distance = calculateDistance(
      STORE_COORDINATES.lat,
      STORE_COORDINATES.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );

    // Calcular frete
    const shippingRateCents = calculateShippingRate(distance);
    const shippingRateReais = shippingRateCents / 100;

    // Determinar prazo de entrega baseado na distância
    let estimatedDays = 1;
    if (distance > 100) {
      estimatedDays = 3;
    } else if (distance > 50) {
      estimatedDays = 2;
    }

    return NextResponse.json({
      success: true,
      shipping: {
        rateCents: shippingRateCents,
        rateReais: shippingRateReais,
        distanceKm: Math.round(distance * 10) / 10, // Arredondar para 1 casa decimal
        estimatedDays,
        origin: {
          city: STORE_COORDINATES.city,
          state: STORE_COORDINATES.state,
        },
        destination: {
          zipCode: cleanZipCode,
          city,
          state,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return NextResponse.json(
      { error: "Erro interno ao calcular frete" },
      { status: 500 }
    );
  }
}

// Endpoint para obter apenas dados do CEP (sem cálculo de frete)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zipCode = searchParams.get("zipCode");

    if (!zipCode) {
      return NextResponse.json({ error: "CEP é obrigatório" }, { status: 400 });
    }

    const cleanZipCode = zipCode.replace(/\D/g, "");

    if (cleanZipCode.length !== 8) {
      return NextResponse.json(
        { error: "CEP deve ter 8 dígitos" },
        { status: 400 }
      );
    }

    // Consultar ViaCEP
    const response = await fetch(
      `https://viacep.com.br/ws/${cleanZipCode}/json/`
    );

    if (!response.ok) {
      throw new Error("Erro ao consultar CEP");
    }

    const cepData: ViaCEPResponse = await response.json();

    if (cepData.erro) {
      return NextResponse.json(
        { error: "CEP não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      address: {
        zipCode: cepData.cep,
        street: cepData.logradouro,
        neighborhood: cepData.bairro,
        city: cepData.localidade,
        state: cepData.uf,
        complement: cepData.complemento,
      },
    });
  } catch (error) {
    console.error("Erro ao consultar CEP:", error);
    return NextResponse.json(
      { error: "Erro interno ao consultar CEP" },
      { status: 500 }
    );
  }
}
