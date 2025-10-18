import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create test users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "user_admin_test",
      email: "admin@example.com",
      emailVerified: true,
      name: "Admin User",
      username: "admin",
      role: "admin",
      image: null,
    },
  });

  const candidateUser = await prisma.user.upsert({
    where: { email: "candidate@example.com" },
    update: {},
    create: {
      id: "user_candidate_test",
      email: "candidate@example.com",
      emailVerified: true,
      name: "Jane Candidate",
      username: "janecandidate",
      role: "user",
      image: null,
    },
  });

  const interviewerUser = await prisma.user.upsert({
    where: { email: "interviewer@example.com" },
    update: {},
    create: {
      id: "user_interviewer_test",
      email: "interviewer@example.com",
      emailVerified: true,
      name: "John Interviewer",
      username: "johninterviewer",
      role: "user",
      image: null,
    },
  });

  console.log(
    `Created users: ${adminUser.id}, ${candidateUser.id}, ${interviewerUser.id}`
  );

  // Create interview templates
  const technicalTemplate = await prisma.interviewTemplate.create({
    data: {
      title: "Full Stack Developer Interview",
      description: "Comprehensive technical interview for full stack positions",
      category: "Technical",
      difficulty: "Medium",
      duration: 60,
      isPublic: true,
      createdBy: adminUser.id,
      tags: ["javascript", "react", "node.js", "databases"],
      questions: {
        create: [
          {
            question:
              "Explain the concept of closures in JavaScript and provide an example.",
            questionType: "technical",
            difficulty: "Medium",
            expectedAnswer:
              "A closure is a function that has access to variables in its outer scope...",
            timeLimit: 10,
            codeLanguages: ["javascript"],
            evaluationCriteria:
              "Understanding of scope, practical examples, edge cases",
            order: 1,
          },
          {
            question:
              "Design a REST API for a simple blog application. What endpoints would you create?",
            questionType: "system-design",
            difficulty: "Medium",
            expectedAnswer:
              "GET /posts, POST /posts, GET /posts/:id, PUT /posts/:id, DELETE /posts/:id...",
            timeLimit: 15,
            codeLanguages: [],
            evaluationCriteria:
              "RESTful principles, proper HTTP methods, resource naming",
            order: 2,
          },
          {
            question: "Implement a function to reverse a linked list.",
            questionType: "coding",
            difficulty: "Easy",
            expectedAnswer:
              "Iterative or recursive solution with proper node manipulation",
            timeLimit: 20,
            codeLanguages: ["javascript", "python", "java"],
            evaluationCriteria:
              "Correctness, time complexity O(n), space complexity consideration",
            order: 3,
          },
        ],
      },
    },
  });

  const behavioralTemplate = await prisma.interviewTemplate.create({
    data: {
      title: "Leadership & Communication Assessment",
      description:
        "Behavioral interview focusing on soft skills and team dynamics",
      category: "Behavioral",
      difficulty: "Easy",
      duration: 45,
      isPublic: true,
      createdBy: adminUser.id,
      tags: ["leadership", "communication", "teamwork"],
      questions: {
        create: [
          {
            question:
              "Tell me about a time when you had to deal with a difficult team member.",
            questionType: "behavioral",
            difficulty: "Medium",
            expectedAnswer: "STAR method: Situation, Task, Action, Result",
            timeLimit: 5,
            codeLanguages: [],
            evaluationCriteria:
              "Communication skills, conflict resolution, professionalism",
            order: 1,
          },
          {
            question:
              "Describe a situation where you had to learn a new technology quickly.",
            questionType: "behavioral",
            difficulty: "Easy",
            expectedAnswer: "Learning approach, resourcefulness, adaptability",
            timeLimit: 5,
            codeLanguages: [],
            evaluationCriteria: "Learning agility, problem-solving, initiative",
            order: 2,
          },
        ],
      },
    },
  });

  const systemDesignTemplate = await prisma.interviewTemplate.create({
    data: {
      title: "Senior Engineer System Design",
      description: "Advanced system design interview for senior positions",
      category: "System Design",
      difficulty: "Hard",
      duration: 90,
      isPublic: true,
      createdBy: adminUser.id,
      tags: ["scalability", "architecture", "distributed-systems"],
      questions: {
        create: [
          {
            question:
              "Design a URL shortening service like bit.ly. Consider scalability, caching, and analytics.",
            questionType: "system-design",
            difficulty: "Hard",
            expectedAnswer:
              "Database schema, hashing algorithm, caching strategy, load balancing",
            timeLimit: 45,
            codeLanguages: [],
            evaluationCriteria:
              "Scalability, trade-offs, component design, database choices",
            order: 1,
          },
          {
            question: "How would you design a rate limiter for an API?",
            questionType: "system-design",
            difficulty: "Hard",
            expectedAnswer:
              "Token bucket, sliding window, distributed implementation",
            timeLimit: 30,
            codeLanguages: [],
            evaluationCriteria:
              "Algorithm choice, distributed systems, edge cases",
            order: 2,
          },
        ],
      },
    },
  });

  console.log(
    `Created templates: ${technicalTemplate.id}, ${behavioralTemplate.id}, ${systemDesignTemplate.id}`
  );

  // Create sample interviews
  const interview1 = await prisma.interview.create({
    data: {
      candidateId: candidateUser.id,
      interviewerId: interviewerUser.id,
      templateId: technicalTemplate.id,
      status: "completed",
      scheduledAt: new Date("2024-10-01T10:00:00Z"),
      startedAt: new Date("2024-10-01T10:05:00Z"),
      completedAt: new Date("2024-10-01T11:15:00Z"),
      duration: 70,
      overallScore: 85,
      technicalScore: 88,
      behavioralScore: 82,
      communicationScore: 84,
      isAIInterviewer: false,
      allowRecording: true,
      settings: JSON.stringify({
        type: "video",
        meetingLink: "https://meet.example.com/interview1",
      }),
    },
  });

  const interview2 = await prisma.interview.create({
    data: {
      candidateId: candidateUser.id,
      interviewerId: interviewerUser.id,
      templateId: behavioralTemplate.id,
      status: "scheduled",
      scheduledAt: new Date("2024-10-20T14:00:00Z"),
      isAIInterviewer: false,
      allowRecording: true,
      settings: JSON.stringify({
        type: "video",
        meetingLink: "https://meet.example.com/interview2",
      }),
    },
  });

  console.log(`Created interviews: ${interview1.id}, ${interview2.id}`);

  // Create interview analytics for completed interview
  await prisma.interviewAnalytics.create({
    data: {
      interviewId: interview1.id,
      speechClarity: 0.85,
      speechPace: 0.78,
      fillerWords: 12,
      confidence: 0.82,
      eyeContact: 0.88,
      facialExpressions: JSON.stringify({
        positive: 0.75,
        neutral: 0.2,
        negative: 0.05,
      }),
      bodyLanguage: JSON.stringify({
        engaged: 0.8,
        relaxed: 0.15,
        tense: 0.05,
      }),
      responseTime: 5.2,
      accuracyScore: 0.87,
      problemSolvingScore: 0.85,
      attention: 0.9,
      participation: 0.88,
      analysisData: JSON.stringify({
        strengths: [
          "Strong technical knowledge",
          "Good communication",
          "Problem-solving approach",
        ],
        improvements: [
          "Could provide more concrete examples",
          "Time management",
        ],
        recommendations:
          "Excellent candidate, recommend to proceed to next round",
      }),
    },
  });

  // Create evaluation
  await prisma.interviewEvaluation.create({
    data: {
      interviewId: interview1.id,
      evaluatorId: interviewerUser.id,
      technicalScore: 88,
      behavioralScore: 82,
      communicationScore: 84,
      overallScore: 85,
      strengths:
        "Strong technical foundation, good problem-solving skills, clear communication",
      improvements:
        "Could improve on system design concepts, needs more experience with microservices",
      recommendation: "hire",
      notes:
        "Impressive candidate with solid fundamentals. Would be a great addition to the team.",
    },
  });

  // Create candidate profile
  await prisma.candidateProfile.create({
    data: {
      userId: candidateUser.id,
      resume: "Senior Full Stack Developer with 5 years of experience...",
      skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
      experience: JSON.stringify([
        {
          company: "Tech Corp",
          title: "Senior Developer",
          duration: "2020-2024",
          description: "Led development of microservices architecture",
        },
      ]),
      education: JSON.stringify([
        {
          institution: "University of Technology",
          degree: "BS Computer Science",
          year: "2019",
        },
      ]),
      linkedIn: "https://linkedin.com/in/janecandidate",
      github: "https://github.com/janecandidate",
      jobTitle: "Full Stack Developer",
      remote: true,
    },
  });

  // Create AI mock session
  await prisma.aIMockSession.create({
    data: {
      userId: candidateUser.id,
      sessionType: "practice",
      aiPersonality: "professional",
      difficultyLevel: "intermediate",
      topics: ["JavaScript", "System Design", "Problem Solving"],
      duration: 45,
      conversationLog: JSON.stringify([
        { role: "ai", message: "Let's start with a technical question..." },
        { role: "user", message: "Sure, I'm ready." },
      ]),
      feedback:
        "Good practice session. Focus more on explaining your thought process.",
      improvementAreas: ["Time management", "Communication clarity"],
      overallScore: 78,
      specificScores: JSON.stringify({
        technical: 82,
        communication: 74,
        problemSolving: 80,
      }),
      startedAt: new Date("2024-10-05T15:00:00Z"),
      completedAt: new Date("2024-10-05T15:45:00Z"),
    },
  });

  console.log(`Seeding finished successfully!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
