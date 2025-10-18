"use client";

import { useState, useEffect } from "react";
import { useCVStore } from "@/store/cv-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
	MessageSquare,
	Brain,
	RefreshCw,
	Copy,
	CheckCircle2,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface InterviewQuestion {
	id: string;
	question: string;
	difficulty: "easy" | "medium" | "hard";
	category: string;
	suggestedAnswer: string;
	keyPoints: string[];
	confidence: number;
}

export function InterviewQAPredictor() {
	const { cvData } = useCVStore();
	const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const generateQuestions = async () => {
		setIsGenerating(true);
		toast.loading("AI is analyzing your CV and generating interview questions...");

		// Simulate AI generation based on CV data
		setTimeout(() => {
			const mockQuestions: InterviewQuestion[] = [];
			
			// Generate questions from experience
			cvData.experience.forEach((exp, index) => {
				mockQuestions.push({
					id: `exp-${index}-1`,
					question: `Tell me about your role as ${exp.title} at ${exp.company}. What were your key achievements?`,
					difficulty: "medium",
					category: "Experience",
					suggestedAnswer: `In my role as ${exp.title} at ${exp.company}, I was responsible for ${exp.description.split('.')[0]}. One of my key achievements was successfully ${exp.description.includes('led') ? 'leading the team' : 'contributing to'} projects that resulted in significant impact. I utilized my skills in problem-solving and collaboration to deliver results.`,
					keyPoints: [
						"Start with your role and responsibilities",
						"Highlight 2-3 specific achievements with metrics",
						"Mention technologies/skills used",
						"End with the impact on business/team"
					],
					confidence: 92
				});

				mockQuestions.push({
					id: `exp-${index}-2`,
					question: `What was the biggest challenge you faced at ${exp.company} and how did you overcome it?`,
					difficulty: "hard",
					category: "Problem Solving",
					suggestedAnswer: `At ${exp.company}, I faced a significant challenge when [describe challenge]. I approached this by breaking down the problem, consulting with team members, and implementing a systematic solution. This taught me the importance of persistence and creative thinking in overcoming obstacles.`,
					keyPoints: [
						"Use STAR method (Situation, Task, Action, Result)",
						"Focus on YOUR actions and decisions",
						"Quantify the results when possible",
						"Show what you learned from the experience"
					],
					confidence: 88
				});
			});

			// Generate questions from skills
			if (cvData.skills.length > 0) {
				const topSkills = cvData.skills[0];
				mockQuestions.push({
					id: "skills-1",
					question: `I see you have expertise in ${topSkills.items.slice(0, 3).join(', ')}. How have you applied these skills in real projects?`,
					difficulty: "medium",
					category: "Technical Skills",
					suggestedAnswer: `I've applied these skills extensively in my previous roles. For example, I used ${topSkills.items[0]} to build scalable solutions that improved performance by 40%. My experience with ${topSkills.items[1]} allowed me to implement efficient architectures, and ${topSkills.items[2]} helped me ensure code quality and maintainability.`,
					keyPoints: [
						"Give specific project examples",
						"Mention the business impact",
						"Discuss how you stay updated with these technologies",
						"Share any certifications or training"
					],
					confidence: 95
				});

				mockQuestions.push({
					id: "skills-2",
					question: `How do you keep your ${topSkills.category} skills up to date with the rapidly changing technology landscape?`,
					difficulty: "easy",
					category: "Learning & Development",
					suggestedAnswer: `I'm committed to continuous learning. I regularly follow industry blogs, complete online courses on platforms like Coursera and Udemy, contribute to open-source projects, and attend tech meetups and conferences. I also experiment with new technologies through side projects to understand their practical applications.`,
					keyPoints: [
						"Mention specific resources you use",
						"Share recent courses or certifications",
						"Discuss side projects or contributions",
						"Show enthusiasm for learning"
					],
					confidence: 90
				});
			}

			// Behavioral questions
			mockQuestions.push({
				id: "behavioral-1",
				question: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
				difficulty: "hard",
				category: "Behavioral",
				suggestedAnswer: `In a previous project, I worked with a team member who had different working styles. Instead of letting it create friction, I initiated a one-on-one conversation to understand their perspective. We found common ground by establishing clear communication channels and defining our roles more explicitly. This improved our collaboration and we successfully delivered the project ahead of schedule.`,
				keyPoints: [
					"Show empathy and emotional intelligence",
					"Focus on resolution, not blame",
					"Demonstrate communication skills",
					"Highlight positive outcome"
				],
				confidence: 85
			});

			mockQuestions.push({
				id: "behavioral-2",
				question: "Why are you interested in this position and our company?",
				difficulty: "easy",
				category: "Motivation",
				suggestedAnswer: `I'm excited about this opportunity because it aligns perfectly with my experience in ${cvData.experience[0]?.title || 'technology'} and my passion for ${cvData.skills[0]?.category || 'innovation'}. I've been following your company's work in [industry/product], and I'm impressed by your commitment to [company value]. I believe my skills in ${cvData.skills[0]?.items.slice(0, 2).join(' and ') || 'problem-solving'} would allow me to make significant contributions to your team.`,
				keyPoints: [
					"Research the company thoroughly",
					"Connect your skills to their needs",
					"Show genuine enthusiasm",
					"Mention specific projects or values that resonate"
				],
				confidence: 93
			});

			setQuestions(mockQuestions);
			toast.dismiss();
			toast.success(`Generated ${mockQuestions.length} AI-powered interview questions!`);
			setIsGenerating(false);
		}, 2000);
	};

	useEffect(() => {
		if (cvData.experience.length > 0 || cvData.skills.length > 0) {
			generateQuestions();
		}
	}, []);

	const handleCopyAnswer = async (question: InterviewQuestion) => {
		await navigator.clipboard.writeText(question.suggestedAnswer);
		setCopiedId(question.id);
		toast.success("Answer copied to clipboard!");
		setTimeout(() => setCopiedId(null), 2000);
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "easy":
				return "bg-green-500/10 text-green-700 dark:text-green-400";
			case "medium":
				return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
			case "hard":
				return "bg-red-500/10 text-red-700 dark:text-red-400";
			default:
				return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
		}
	};

	return (
		<Card className="p-6 h-full flex flex-col">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-purple-500/10 rounded-lg">
						<Brain className="h-5 w-5 text-purple-600" />
					</div>
					<div>
						<h3 className="font-semibold text-lg">AI Interview Predictor</h3>
						<p className="text-sm text-muted-foreground">Likely questions based on your CV</p>
					</div>
				</div>
				<Button
					size="sm"
					onClick={generateQuestions}
					disabled={isGenerating}
					variant="outline"
				>
					<RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
					Regenerate
				</Button>
			</div>

			{questions.length === 0 && !isGenerating && (
				<div className="flex-1 flex items-center justify-center text-center p-8">
					<div>
						<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground">
							Add experience and skills to generate interview questions
						</p>
					</div>
				</div>
			)}

			<ScrollArea className="flex-1">
				<AnimatePresence>
					<div className="space-y-4">
						{questions.map((question, index) => (
							<motion.div
								key={question.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card
									className={`p-4 cursor-pointer transition-all hover:shadow-md ${
										selectedQuestion === question.id ? "ring-2 ring-purple-500" : ""
									}`}
									onClick={() =>
										setSelectedQuestion(selectedQuestion === question.id ? null : question.id)
									}
								>
									<div className="space-y-3">
										{/* Question Header */}
										<div className="flex items-start justify-between gap-3">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<Badge variant="outline" className="text-xs">
														{question.category}
													</Badge>
													<Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
														{question.difficulty}
													</Badge>
													<div className="flex items-center gap-1 ml-auto">
														<Sparkles className="h-3 w-3 text-purple-500" />
														<span className="text-xs text-muted-foreground">
															{question.confidence}% match
														</span>
													</div>
												</div>
												<p className="font-medium text-sm leading-relaxed">
													{question.question}
												</p>
											</div>
										</div>

										{/* Expanded Answer */}
										<AnimatePresence>
											{selectedQuestion === question.id && (
												<motion.div
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: "auto" }}
													exit={{ opacity: 0, height: 0 }}
													className="space-y-4 pt-4 border-t"
												>
													{/* Suggested Answer */}
													<div>
														<div className="flex items-center justify-between mb-2">
															<Label className="text-sm font-semibold flex items-center gap-2">
																<Brain className="h-4 w-4 text-purple-500" />
																AI-Generated Answer
															</Label>
															<Button
																size="sm"
																variant="ghost"
																onClick={(e) => {
																	e.stopPropagation();
																	handleCopyAnswer(question);
																}}
															>
																{copiedId === question.id ? (
																	<CheckCircle2 className="h-4 w-4 text-green-500" />
																) : (
																	<Copy className="h-4 w-4" />
																)}
															</Button>
														</div>
														<p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
															{question.suggestedAnswer}
														</p>
													</div>

													{/* Key Points */}
													<div>
														<Label className="text-sm font-semibold flex items-center gap-2 mb-2">
															<TrendingUp className="h-4 w-4 text-blue-500" />
															Key Points to Remember
														</Label>
														<ul className="space-y-2">
															{question.keyPoints.map((point, i) => (
																<li key={i} className="flex items-start gap-2 text-sm">
																	<CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
																	<span className="text-muted-foreground">{point}</span>
																</li>
															))}
														</ul>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</Card>
							</motion.div>
						))}
					</div>
				</AnimatePresence>
			</ScrollArea>

			{questions.length > 0 && (
				<div className="mt-4 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
					<div className="flex items-start gap-3">
						<Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
						<div className="flex-1 text-sm">
							<p className="font-medium text-purple-700 dark:text-purple-400 mb-1">
								Pro Tip: Practice with AI
							</p>
							<p className="text-muted-foreground text-xs">
								Use these questions to prepare. Remember to personalize the answers with your own examples and metrics!
							</p>
						</div>
					</div>
				</div>
			)}
		</Card>
	);
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={className}>{children}</div>;
}
