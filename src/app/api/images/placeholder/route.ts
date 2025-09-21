import { NextResponse } from "next/server";

export async function GET() {
  // Retornar uma imagem SVG simples como fallback
  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <circle cx="100" cy="80" r="20" fill="#d1d5db"/>
      <rect x="70" y="120" width="60" height="40" rx="4" fill="#d1d5db"/>
      <text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
        Sem imagem
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400", // Cache por 1 dia
    },
  });
}
