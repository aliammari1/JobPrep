-- CreateTable
CREATE TABLE "code_draft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_draft_userId_idx" ON "code_draft"("userId");

-- CreateIndex
CREATE INDEX "code_draft_challengeId_idx" ON "code_draft"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "code_draft_userId_challengeId_key" ON "code_draft"("userId", "challengeId");

-- AddForeignKey
ALTER TABLE "code_draft" ADD CONSTRAINT "code_draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
