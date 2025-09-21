/*
  Warnings:

  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryCity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryState` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryZip` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "deliveryAddress" TEXT NOT NULL,
ADD COLUMN     "deliveryCity" TEXT NOT NULL,
ADD COLUMN     "deliveryState" TEXT NOT NULL,
ADD COLUMN     "deliveryZip" TEXT NOT NULL,
ADD COLUMN     "shippingCents" INTEGER NOT NULL DEFAULT 2000;
