-- AlterTable
ALTER TABLE "code_submission" ADD COLUMN     "challengeId" TEXT;

-- CreateTable
CREATE TABLE "challenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "constraints" TEXT[],
    "examples" JSONB NOT NULL,
    "testCases" JSONB NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 1000,
    "memoryLimit" INTEGER NOT NULL DEFAULT 256,
    "category" TEXT,
    "tags" TEXT[],
    "hints" TEXT[],
    "starterCode" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_userId_idx" ON "challenge"("userId");

-- CreateIndex
CREATE INDEX "challenge_difficulty_idx" ON "challenge"("difficulty");

-- CreateIndex
CREATE INDEX "challenge_category_idx" ON "challenge"("category");

-- CreateIndex
CREATE INDEX "code_submission_challengeId_idx" ON "code_submission"("challengeId");

-- AddForeignKey
ALTER TABLE "code_submission" ADD CONSTRAINT "code_submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
