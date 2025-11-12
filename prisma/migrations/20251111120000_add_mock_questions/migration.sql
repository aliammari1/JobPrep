-- CreateTable
CREATE TABLE "mock_question" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "idealAnswer" TEXT,
    "userAnswer" TEXT,
    "timeSpent" INTEGER,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "suggestions" TEXT[],
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mock_question" ADD CONSTRAINT "mock_question_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_mock_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
