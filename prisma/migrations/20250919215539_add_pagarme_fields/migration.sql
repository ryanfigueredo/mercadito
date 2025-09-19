-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "pagarmeChargeId" TEXT,
ADD COLUMN     "pagarmeOrderId" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "pixQrCode" TEXT,
ADD COLUMN     "pixQrCodeUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "document" TEXT,
ADD COLUMN     "phone" TEXT;
