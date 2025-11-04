import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const shippingConfigSchema = z.object({
  storeLat: z.number(),
  storeLng: z.number(),
  storeCity: z.string(),
  storeState: z.string(),
  storeAddress: z.string().optional(),
  storeZipCode: z.string().optional(),
  shippingRates: z.array(
    z.object({
      maxDistance: z.number(),
      rate: z.number(),
    })
  ),
});

// GET: Buscar configuração atual
export async function GET() {
  try {
    let config = await prisma.shippingConfig.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    // Se não existe, criar uma padrão
    if (!config) {
      config = await prisma.shippingConfig.create({
        data: {
          id: "default-shipping-config",
          storeLat: -12.2387,
          storeLng: -38.9753,
          storeCity: "Feira de Santana",
          storeState: "BA",
          shippingRates: [
            { maxDistance: 5, rate: 0 },
            { maxDistance: 10, rate: 800 },
            { maxDistance: 20, rate: 1200 },
            { maxDistance: 50, rate: 2000 },
            { maxDistance: 100, rate: 3500 },
            { maxDistance: 200, rate: 5000 },
            { maxDistance: 999999, rate: 8000 },
          ],
          isActive: true,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao buscar configuração de frete:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuração" },
      { status: 500 }
    );
  }
}

// POST/PUT: Salvar configuração
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = shippingConfigSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Desativar todas as outras configurações
    await prisma.shippingConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Criar nova configuração ativa
    const config = await prisma.shippingConfig.create({
      data: {
        storeLat: data.storeLat,
        storeLng: data.storeLng,
        storeCity: data.storeCity,
        storeState: data.storeState,
        storeAddress: data.storeAddress,
        storeZipCode: data.storeZipCode,
        shippingRates: data.shippingRates as any,
        isActive: true,
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar configuração de frete:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    );
  }
}
