-- CreateTable
CREATE TABLE "integration_token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "tokenType" TEXT NOT NULL DEFAULT 'Bearer',
    "scope" TEXT,
    "profileData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_token_userId_idx" ON "integration_token"("userId");

-- CreateIndex
CREATE INDEX "integration_token_provider_idx" ON "integration_token"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "integration_token_userId_provider_key" ON "integration_token"("userId", "provider");

-- AddForeignKey
ALTER TABLE "integration_token" ADD CONSTRAINT "integration_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
