"use client";

import { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
	Target,
	TrendingUp,
	AlertTriangle,
	CheckCircle2,
	ExternalLink,
	BookOpen,
	Clock,
	Sparkles,
	Zap,
	Brain,
} from "lucide-react";
import { toast } from "sonner";

interface SkillGap {
	skill: string;
	proficiency: "beginner" | "intermediate" | "advanced" | "expert";
	required: boolean;
	found: boolean;
	importance: "critical" | "high" | "medium" | "low";
}

interface LearningResource {
	title: string;
	provider: string;
	duration: string;
	type: "course" | "certification" | "tutorial" | "book";
	url: string;
	rating: number;
	price: "free" | "paid";
}

interface SkillAnalysis {
	matchPercentage: number;
	missingSkills: SkillGap[];
	matchingSkills: SkillGap[];
	learningPath: LearningResource[];
	estimatedTime: string;
}

export function SkillsGapAnalyzer() {
	const { cvData } = useCVStore();
	const [jobDescription, setJobDescription] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);

	const analyzeSkillsGap = async () => {
		if (!jobDescription.trim()) {
			toast.error("Please paste a job description first");
			return;
		}

		setIsAnalyzing(true);
		toast.loading("AI is analyzing skills gap...");

		// Simulate AI analysis
		setTimeout(() => {
			const allCVSkills = cvData.skills.flatMap((category) =>
				category.items.map((skill) => skill.toLowerCase())
			);

			// Extract skills from job description (simplified)
			const jobSkills = extractSkillsFromJobDescription(jobDescription);

			const missingSkills: SkillGap[] = jobSkills
				.filter((skill) => !allCVSkills.includes(skill.skill.toLowerCase()))
				.map((skill) => ({
					...skill,
					found: false,
				}));

			const matchingSkills: SkillGap[] = jobSkills
				.filter((skill) => allCVSkills.includes(skill.skill.toLowerCase()))
				.map((skill) => ({
					...skill,
					found: true,
				}));

			const matchPercentage = Math.round(
				(matchingSkills.length / jobSkills.length) * 100
			);

			const learningPath = generateLearningPath(missingSkills);
			const estimatedTime = calculateEstimatedTime(learningPath);

			setAnalysis({
				matchPercentage,
				missingSkills,
				matchingSkills,
				learningPath,
				estimatedTime,
			});

			toast.dismiss();
			toast.success(`Analysis complete! ${matchPercentage}% skills match`);
			setIsAnalyzing(false);
		}, 2500);
	};

	const extractSkillsFromJobDescription = (text: string): SkillGap[] => {
		// Common tech skills to look for (in production, use NLP/LLM)
		const skillsDatabase = [
			{ skill: "React", importance: "critical" as const },
			{ skill: "TypeScript", importance: "high" as const },
			{ skill: "Node.js", importance: "high" as const },
			{ skill: "Python", importance: "high" as const },
			{ skill: "AWS", importance: "critical" as const },
			{ skill: "Docker", importance: "high" as const },
			{ skill: "Kubernetes", importance: "medium" as const },
			{ skill: "GraphQL", importance: "medium" as const },
			{ skill: "MongoDB", importance: "medium" as const },
			{ skill: "PostgreSQL", importance: "high" as const },
			{ skill: "Git", importance: "high" as const },
			{ skill: "CI/CD", importance: "high" as const },
			{ skill: "Agile", importance: "medium" as const },
			{ skill: "REST API", importance: "high" as const },
			{ skill: "Microservices", importance: "high" as const },
		];

		const lowerText = text.toLowerCase();
		return skillsDatabase
			.filter((item) => lowerText.includes(item.skill.toLowerCase()))
			.map((item) => ({
				...item,
				proficiency: "intermediate" as const,
				required: item.importance === "critical" || item.importance === "high",
				found: false,
			}));
	};

	const generateLearningPath = (gaps: SkillGap[]): LearningResource[] => {
		const resourcesMap: { [key: string]: LearningResource } = {
			React: {
				title: "React - The Complete Guide 2024",
				provider: "Udemy",
				duration: "48 hours",
				type: "course",
				url: "https://udemy.com",
				rating: 4.8,
				price: "paid",
			},
			TypeScript: {
				title: "Understanding TypeScript",
				provider: "Udemy",
				duration: "15 hours",
				type: "course",
				url: "https://udemy.com",
				rating: 4.7,
				price: "paid",
			},
			AWS: {
				title: "AWS Certified Solutions Architect",
				provider: "AWS",
				duration: "40 hours",
				type: "certification",
				url: "https://aws.amazon.com",
				rating: 4.9,
				price: "paid",
			},
			Docker: {
				title: "Docker Mastery",
				provider: "Udemy",
				duration: "20 hours",
				type: "course",
				url: "https://udemy.com",
				rating: 4.6,
				price: "paid",
			},
			Kubernetes: {
				title: "Kubernetes for Developers",
				provider: "Linux Foundation",
				duration: "30 hours",
				type: "certification",
				url: "https://linuxfoundation.org",
				rating: 4.8,
				price: "paid",
			},
		};

		return gaps
			.filter((gap) => resourcesMap[gap.skill])
			.map((gap) => resourcesMap[gap.skill]);
	};

	const calculateEstimatedTime = (resources: LearningResource[]): string => {
		const totalHours = resources.reduce((sum, resource) => {
			const hours = parseInt(resource.duration);
			return sum + hours;
		}, 0);

		if (totalHours < 24) {
			return `${totalHours} hours`;
		} else if (totalHours < 168) {
			return `${Math.round(totalHours / 24)} days`;
		} else {
			return `${Math.round(totalHours / 168)} weeks`;
		}
	};

	const getImportanceColor = (importance: string) => {
		switch (importance) {
			case "critical":
				return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
			case "high":
				return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
			case "medium":
				return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
			case "low":
				return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
			default:
				return "";
		}
	};

	return (
		<div className="space-y-6">
			{/* Input Section */}
			<Card className="p-6">
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-500/10 rounded-lg">
							<Target className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-semibold text-lg">Skills Gap Analyzer</h3>
							<p className="text-sm text-muted-foreground">
								Paste job description to find missing skills
							</p>
						</div>
					</div>

					<Textarea
						placeholder="Paste the job description here..."
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
						className="min-h-[150px] font-mono text-sm"
					/>

					<Button
						onClick={analyzeSkillsGap}
						disabled={isAnalyzing || !jobDescription.trim()}
						className="w-full"
					>
						{isAnalyzing ? (
							<>
								<Brain className="mr-2 h-4 w-4 animate-pulse" />
								Analyzing...
							</>
						) : (
							<>
								<Sparkles className="mr-2 h-4 w-4" />
								Analyze Skills Gap
							</>
						)}
					</Button>
				</div>
			</Card>

			{/* Analysis Results */}
			<AnimatePresence>
				{analysis && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						{/* Match Score */}
						<Card className="p-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold flex items-center gap-2">
										<TrendingUp className="h-5 w-5 text-green-600" />
										Skills Match Score
									</h4>
									<Badge
										variant="outline"
										className={
											analysis.matchPercentage >= 80
												? "bg-green-500/10 text-green-700 border-green-500/20"
												: analysis.matchPercentage >= 60
												? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
												: "bg-red-500/10 text-red-700 border-red-500/20"
										}
									>
										{analysis.matchPercentage}% Match
									</Badge>
								</div>

								<div>
									<Progress value={analysis.matchPercentage} className="h-3" />
									<div className="flex justify-between mt-2 text-xs text-muted-foreground">
										<span>{analysis.matchingSkills.length} skills found</span>
										<span>{analysis.missingSkills.length} skills missing</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 pt-4 border-t">
									<div className="text-center">
										<CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
										<div className="text-2xl font-bold">{analysis.matchingSkills.length}</div>
										<div className="text-sm text-muted-foreground">Matching Skills</div>
									</div>
									<div className="text-center">
										<AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
										<div className="text-2xl font-bold">{analysis.missingSkills.length}</div>
										<div className="text-sm text-muted-foreground">Skills to Learn</div>
									</div>
								</div>
							</div>
						</Card>

						{/* Missing Skills */}
						{analysis.missingSkills.length > 0 && (
							<Card className="p-6">
								<h4 className="font-semibold mb-4 flex items-center gap-2">
									<AlertTriangle className="h-5 w-5 text-orange-600" />
									Skills to Develop
								</h4>

								<div className="space-y-3">
									{analysis.missingSkills.map((skill, index) => (
										<motion.div
											key={skill.skill}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
										>
											<div className="flex items-center gap-3">
												<Zap className="h-5 w-5 text-orange-500" />
												<div>
													<span className="font-medium">{skill.skill}</span>
													{skill.required && (
														<Badge
															variant="outline"
															className="ml-2 text-xs bg-red-500/10 text-red-600"
														>
															Required
														</Badge>
													)}
												</div>
											</div>
											<Badge className={`${getImportanceColor(skill.importance)} text-xs`}>
												{skill.importance}
											</Badge>
										</motion.div>
									))}
								</div>
							</Card>
						)}

						{/* Learning Path */}
						{analysis.learningPath.length > 0 && (
							<Card className="p-6">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h4 className="font-semibold flex items-center gap-2">
											<BookOpen className="h-5 w-5 text-purple-600" />
											Recommended Learning Path
										</h4>
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Clock className="h-4 w-4" />
											<span>~{analysis.estimatedTime}</span>
										</div>
									</div>

									<ScrollArea className="h-[300px] pr-4">
										<div className="space-y-3">
											{analysis.learningPath.map((resource, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.1 }}
												>
													<Card className="p-4 hover:shadow-md transition-shadow">
														<div className="space-y-2">
															<div className="flex items-start justify-between gap-3">
																<div className="flex-1">
																	<h5 className="font-medium text-sm">{resource.title}</h5>
																	<p className="text-xs text-muted-foreground mt-1">
																		{resource.provider} • {resource.duration}
																	</p>
																</div>
																<Badge variant="outline" className="text-xs">
																	{resource.type}
																</Badge>
															</div>

															<div className="flex items-center justify-between">
																<div className="flex items-center gap-3">
																	<div className="flex items-center gap-1">
																		<span className="text-yellow-500">★</span>
																		<span className="text-xs font-medium">{resource.rating}</span>
																	</div>
																	<Badge
																		variant="outline"
																		className={`text-xs ${
																			resource.price === "free"
																				? "bg-green-500/10 text-green-600"
																				: "bg-blue-500/10 text-blue-600"
																		}`}
																	>
																		{resource.price === "free" ? "Free" : "Paid"}
																	</Badge>
																</div>
																<Button size="sm" variant="ghost" asChild>
																	<a href={resource.url} target="_blank" rel="noopener noreferrer">
																		<ExternalLink className="h-4 w-4" />
																	</a>
																</Button>
															</div>
														</div>
													</Card>
												</motion.div>
											))}
										</div>
									</ScrollArea>
								</div>
							</Card>
						)}

						{/* Matching Skills */}
						{analysis.matchingSkills.length > 0 && (
							<Card className="p-6 bg-green-500/5 border-green-500/20">
								<h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
									<CheckCircle2 className="h-5 w-5" />
									Your Matching Skills
								</h4>
								<div className="flex flex-wrap gap-2">
									{analysis.matchingSkills.map((skill) => (
										<Badge
											key={skill.skill}
											className="bg-green-500/10 text-green-700 dark:text-green-400"
										>
											{skill.skill}
										</Badge>
									))}
								</div>
							</Card>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Tips */}
			{!analysis && (
				<Card className="p-4 bg-purple-500/5 border-purple-500/20">
					<div className="flex items-start gap-3">
						<Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
						<div className="flex-1 text-sm space-y-1">
							<p className="font-medium text-purple-700 dark:text-purple-400">
								Pro Tip: Get the Best Analysis
							</p>
							<ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
								<li>Paste the complete job description for accurate results</li>
								<li>Include both technical and soft skills requirements</li>
								<li>The AI will extract and categorize skills automatically</li>
							</ul>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
}
