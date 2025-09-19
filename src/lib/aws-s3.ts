import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Retornar URL pública do objeto
    return `https://${BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "us-east-1"
    }.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Erro ao fazer upload para S3:", error);
    throw new Error("Falha no upload da imagem");
  }
}

export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Erro ao deletar do S3:", error);
    throw new Error("Falha ao deletar imagem");
  }
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error);
    throw new Error("Falha ao gerar URL de upload");
  }
}

export function generateProductImageKey(
  productId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const extension = filename.split(".").pop() || "jpg";
  return `products/${productId}/${timestamp}.${extension}`;
}
