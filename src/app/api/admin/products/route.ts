import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  promoText: z.string().optional(),
  stock: z.number().int().min(0).optional(),
});

// Normaliza para "Title Case" (pt-BR): cada palavra com a primeira letra maiúscula
// Mantém preposições e unidades de medida em minúsculas
function toTitleCase(input: string) {
  // Preposições e artigos que devem ficar em minúsculas
  const lowercaseWords = [
    "de", "da", "do", "das", "dos", "e", "em", "no", "na", "nas", "nos",
    "com", "por", "para", "a", "ao", "aos", "às", "ou", "que", "se", "um", "uma", "uns", "umas"
  ];
  
  // Unidades de medida que devem ficar em minúsculas
  const units = ["kg", "g", "mg", "ml", "l", "lt", "lts", "cm", "m", "mm", "un", "unidades", "cx", "caixa", "pct", "pacote"];
  
  return input
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLocaleLowerCase("pt-BR");
      const lowerClean = lower.replace(/[.,;!?]/g, ""); // Remove pontuação para verificação
      
      // Verifica se é número seguido de unidade (ex: "500ML", "5KG")
      const numberUnitMatch = lower.match(/^(\d+)([a-z]+)$/);
      if (numberUnitMatch) {
        const [, number, unitPart] = numberUnitMatch;
        // Verifica se a parte após o número é uma unidade conhecida
        const unitMatch = units.find(u => unitPart === u || unitPart.startsWith(u));
        if (unitMatch && unitPart.length <= 4) { // Limita tamanho para evitar falsos positivos
          return number + unitMatch;
        }
      }
      
      // Primeira palavra sempre capitaliza (exceto se for número)
      if (index === 0 && !/^\d/.test(word)) {
        return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
      }
      
      // Verifica se é apenas número (mantém como está)
      if (/^\d+$/.test(word)) {
        return word;
      }
      
      // Verifica se é unidade de medida isolada (mantém minúscula)
      if (units.includes(lowerClean)) {
        return lower;
      }
      
      // Verifica se é preposição (mantém minúscula, exceto se for a primeira palavra)
      if (lowercaseWords.includes(lowerClean) && index > 0) {
        return lower;
      }
      
      // Demais palavras: primeira letra maiúscula
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join(" ");
}

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const p = parsed.data;
    const normalizedName = toTitleCase(p.name.trim());
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: normalizedName,
        category: p.category,
        priceCents: Math.round(p.price * 100),
        imageUrl: p.imageUrl,
        promoText: p.promoText,
        stock: p.stock ?? 0, // Estoque inicia em 0 se não informado
      },
      update: {
        name: normalizedName,
        category: p.category,
        priceCents: Math.round(p.price * 100),
        imageUrl: p.imageUrl,
        promoText: p.promoText,
        stock: p.stock !== undefined ? p.stock : undefined, // Só atualiza se fornecido
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug)
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  await prisma.product.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
