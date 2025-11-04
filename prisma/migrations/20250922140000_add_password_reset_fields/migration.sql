-- Add password reset fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

-- Add document and phone fields to User table (if not exists)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "document" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Create unique index on document if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "User_document_key" ON "User"("document");

-- Update existing records to have updatedAt (if column doesn't have default)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;
