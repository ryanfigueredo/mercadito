-- Add MercadoPago fields to Order table
ALTER TABLE "Order" ADD COLUMN "mercadopagoPreferenceId" TEXT;
ALTER TABLE "Order" ADD COLUMN "mercadopagoPaymentId" TEXT;
