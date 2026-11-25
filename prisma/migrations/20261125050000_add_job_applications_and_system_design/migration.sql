-- AlterTable
ALTER TABLE "ai_mock_session" ADD COLUMN     "applicationId" TEXT;

-- AlterTable
ALTER TABLE "code_submission" ADD COLUMN     "applicationId" TEXT;

-- AlterTable
ALTER TABLE "cover_letter" ADD COLUMN     "applicationId" TEXT;

-- AlterTable
ALTER TABLE "cv" ADD COLUMN     "applicationId" TEXT;

-- AlterTable
ALTER TABLE "interview" ADD COLUMN     "applicationId" TEXT;

-- CreateTable
CREATE TABLE "job_application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "jobUrl" TEXT,
    "salaryRange" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'saved',
    "jobDescription" TEXT NOT NULL DEFAULT '',
    "atsScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_design_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "nodesJson" TEXT NOT NULL,
    "edgesJson" TEXT NOT NULL,
    "critiqueJson" TEXT,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_design_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_application_userId_idx" ON "job_application"("userId");

-- CreateIndex
CREATE INDEX "job_application_userId_stage_idx" ON "job_application"("userId", "stage");

-- CreateIndex
CREATE INDEX "system_design_session_userId_idx" ON "system_design_session"("userId");

-- CreateIndex
CREATE INDEX "system_design_session_applicationId_idx" ON "system_design_session"("applicationId");

-- CreateIndex
CREATE INDEX "ai_mock_session_applicationId_idx" ON "ai_mock_session"("applicationId");

-- CreateIndex
CREATE INDEX "code_submission_applicationId_idx" ON "code_submission"("applicationId");

-- CreateIndex
CREATE INDEX "cover_letter_applicationId_idx" ON "cover_letter"("applicationId");

-- CreateIndex
CREATE INDEX "cv_applicationId_idx" ON "cv"("applicationId");

-- CreateIndex
CREATE INDEX "interview_applicationId_idx" ON "interview"("applicationId");

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_mock_session" ADD CONSTRAINT "ai_mock_session_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submission" ADD CONSTRAINT "code_submission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv" ADD CONSTRAINT "cv_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_design_session" ADD CONSTRAINT "system_design_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_design_session" ADD CONSTRAINT "system_design_session_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "job_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

