/*
  Warnings:

  - You are about to drop the column `brand` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `currentStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minimumStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salePrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_SALE', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- Create default category
INSERT INTO "Category" ("id", "name", "description", "createdAt", "updatedAt")
VALUES ('default-category', 'Default Category', 'Default category for existing products', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create default brand
INSERT INTO "Brand" ("id", "name", "description", "createdAt", "updatedAt")
VALUES ('default-brand', 'Default Brand', 'Default brand for existing products', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add new columns with default values
ALTER TABLE "Product" ADD COLUMN "barcode" TEXT;
ALTER TABLE "Product" ADD COLUMN "brandId" TEXT DEFAULT 'default-brand';
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT DEFAULT 'default-category';
ALTER TABLE "Product" ADD COLUMN "currentPrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "location" TEXT;
ALTER TABLE "Product" ADD COLUMN "maxQuantity" INTEGER;
ALTER TABLE "Product" ADD COLUMN "minQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "purchasePrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "quantity" INTEGER;
ALTER TABLE "Product" ADD COLUMN "salePrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- Update existing products with values from old columns
UPDATE "Product"
SET 
    "currentPrice" = "price",
    "purchasePrice" = "price",
    "salePrice" = "price",
    "quantity" = "currentStock",
    "minQuantity" = "minimumStock"
WHERE "price" IS NOT NULL;

-- Drop old columns
ALTER TABLE "Product" DROP COLUMN "brand";
ALTER TABLE "Product" DROP COLUMN "category";
ALTER TABLE "Product" DROP COLUMN "currentStock";
ALTER TABLE "Product" DROP COLUMN "minimumStock";
ALTER TABLE "Product" DROP COLUMN "price";

-- Make required columns non-nullable
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "currentPrice" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "purchasePrice" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "quantity" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "salePrice" SET NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN "contact" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "manufacturingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityCheck" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "customerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "_ProductToTag_B_index" ON "_ProductToTag"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCheck" ADD CONSTRAINT "QualityCheck_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD CONSTRAINT "_ProductToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD CONSTRAINT "_ProductToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
