-- CreateTable
CREATE TABLE "cover_letter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "jobTitle" TEXT,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cover_letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "testsPassed" INTEGER,
    "totalTests" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cover_letter_userId_idx" ON "cover_letter"("userId");

-- CreateIndex
CREATE INDEX "cover_letter_createdAt_idx" ON "cover_letter"("createdAt");

-- CreateIndex
CREATE INDEX "code_submission_userId_idx" ON "code_submission"("userId");

-- CreateIndex
CREATE INDEX "code_submission_createdAt_idx" ON "code_submission"("createdAt");

-- AddForeignKey
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submission" ADD CONSTRAINT "code_submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
