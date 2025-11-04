-- AlterTable: Adicionar campo emailVerified na tabela User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: Criar tabela EmailVerification
CREATE TABLE IF NOT EXISTS "EmailVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Email único na tabela EmailVerification
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerification_email_key" ON "EmailVerification"("email");

-- CreateIndex: Index para busca rápida por email
CREATE INDEX IF NOT EXISTS "EmailVerification_email_idx" ON "EmailVerification"("email");
