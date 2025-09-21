import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const s3Key = path.join("/");

    // Validar se é uma imagem de produto
    if (!s3Key.startsWith("products/")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Gerar URL assinada (válida por 1 hora)
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hora
    });

    // Redirecionar para a URL assinada
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error);

    // Retornar imagem placeholder em caso de erro
    return NextResponse.redirect(new URL("/api/images/placeholder", req.url));
  }
}

// Endpoint para imagem placeholder
export async function placeholder() {
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

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400", // Cache por 1 dia
    },
  });
}
