-- CreateTable
CREATE TABLE IF NOT EXISTS "ShippingConfig" (
    "id" TEXT NOT NULL,
    "storeLat" DOUBLE PRECISION NOT NULL DEFAULT -12.2387,
    "storeLng" DOUBLE PRECISION NOT NULL DEFAULT -38.9753,
    "storeCity" TEXT NOT NULL DEFAULT 'Feira de Santana',
    "storeState" TEXT NOT NULL DEFAULT 'BA',
    "storeAddress" TEXT,
    "storeZipCode" TEXT,
    "shippingRates" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingConfig_pkey" PRIMARY KEY ("id")
);

-- Criar registro inicial padrão
INSERT INTO "ShippingConfig" ("id", "storeLat", "storeLng", "storeCity", "storeState", "shippingRates", "isActive", "createdAt", "updatedAt")
VALUES (
    'default-shipping-config',
    -12.2387,
    -38.9753,
    'Feira de Santana',
    'BA',
    '[
        {"maxDistance": 5, "rate": 0},
        {"maxDistance": 10, "rate": 800},
        {"maxDistance": 20, "rate": 1200},
        {"maxDistance": 50, "rate": 2000},
        {"maxDistance": 100, "rate": 3500},
        {"maxDistance": 200, "rate": 5000},
        {"maxDistance": 999999, "rate": 8000}
    ]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;
