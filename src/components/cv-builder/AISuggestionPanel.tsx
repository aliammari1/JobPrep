"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCVStore } from "@/store/cv-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sparkles,
	AlertCircle,
	CheckCircle2,
	Lightbulb,
	TrendingUp,
	X,
	ChevronRight,
} from "lucide-react";

interface Suggestion {
	id: string;
	type: "error" | "warning" | "success" | "info";
	category: string;
	message: string;
	action?: () => void;
	actionLabel?: string;
}

export function AISuggestionPanel() {
	const { cvData } = useCVStore();
	const [isOpen, setIsOpen] = useState(true);
	const [score, setScore] = useState(0);
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

	useEffect(() => {
		// Analyze CV and generate suggestions
		const newSuggestions: Suggestion[] = [];
		let newScore = 100;

		// Check personal info
		if (!cvData.personalInfo.fullName) {
			newSuggestions.push({
				id: "name",
				type: "error",
				category: "Personal Info",
				message: "Add your full name to personalize your CV",
			});
			newScore -= 10;
		}

		if (!cvData.personalInfo.summary || cvData.personalInfo.summary.length < 50) {
			newSuggestions.push({
				id: "summary",
				type: "warning",
				category: "Personal Info",
				message: "Add a compelling professional summary (at least 50 characters)",
			});
			newScore -= 5;
		}

		// Check experience
		if (cvData.experience.length === 0) {
			newSuggestions.push({
				id: "experience",
				type: "error",
				category: "Experience",
				message: "Add at least one work experience entry",
			});
			newScore -= 15;
		} else {
			cvData.experience.forEach((exp) => {
				const description = exp.description.flat().join(" ") || '';
				if (description.length < 100) {
					newSuggestions.push({
						id: `exp-desc-${exp.id}`,
						type: "warning",
						category: "Experience",
						message: `"${exp.title}" description is too short. Add more details about your achievements.`,
					});
					newScore -= 3;
				}

				// Check for action verbs
				const actionVerbs = ["led", "managed", "developed", "implemented", "created", "improved"];
				const hasActionVerb = actionVerbs.some((verb) =>
					description.toLowerCase().includes(verb)
				);
				if (!hasActionVerb) {
					newSuggestions.push({
						id: `exp-verb-${exp.id}`,
						type: "info",
						category: "Experience",
						message: `Use action verbs in "${exp.title}" description (e.g., Led, Managed, Developed)`,
					});
					newScore -= 2;
				}
			});
		}

		// Check education
		if (cvData.education.length === 0) {
			newSuggestions.push({
				id: "education",
				type: "warning",
				category: "Education",
				message: "Consider adding your education background",
			});
			newScore -= 10;
		}

		// Check skills
		if (cvData.skills.length === 0) {
			newSuggestions.push({
				id: "skills",
				type: "error",
				category: "Skills",
				message: "Add your technical and soft skills",
			});
			newScore -= 10;
		}

		// Check for missing sections
		if (cvData.projects.length === 0) {
			newSuggestions.push({
				id: "projects",
				type: "info",
				category: "Projects",
				message: "Showcase your projects to stand out from other candidates",
			});
		}

		if (cvData.certifications.length === 0) {
			newSuggestions.push({
				id: "certifications",
				type: "info",
				category: "Certifications",
				message: "Add relevant certifications to boost your credibility",
			});
		}

		// Success messages
		if (cvData.experience.length > 2) {
			newSuggestions.push({
				id: "exp-success",
				type: "success",
				category: "Experience",
				message: "Great! You have multiple work experiences listed",
			});
		}

		if (cvData.skills.length > 3) {
			newSuggestions.push({
				id: "skills-success",
				type: "success",
				category: "Skills",
				message: "Excellent skill coverage across multiple categories",
			});
		}

		setSuggestions(newSuggestions);
		setScore(Math.max(0, newScore));
	}, [cvData]);

	const getScoreColor = () => {
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreRing = () => {
		if (score >= 80) return "stroke-green-600";
		if (score >= 60) return "stroke-yellow-600";
		return "stroke-red-600";
	};

	const getTypeIcon = (type: Suggestion["type"]) => {
		switch (type) {
			case "error":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			case "warning":
				return <AlertCircle className="h-4 w-4 text-yellow-500" />;
			case "success":
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case "info":
				return <Lightbulb className="h-4 w-4 text-blue-500" />;
		}
	};

	if (!isOpen) {
		return (
			<Button
				onClick={() => setIsOpen(true)}
				className="fixed right-4 top-20 z-40 shadow-lg"
				size="icon"
			>
				<Sparkles className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<motion.div
			initial={{ x: 400, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: 400, opacity: 0 }}
			className="fixed right-4 top-16 z-40 w-80 h-[calc(100vh-5rem)]"
		>
			<Card className="h-full flex flex-col shadow-2xl border-2">
				{/* Header */}
				<div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
					<div className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-purple-600" />
						<h3 className="font-semibold">AI Suggestions</h3>
					</div>
					<Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Score Circle */}
				<div className="p-6 border-b bg-white dark:bg-gray-950">
					<div className="flex items-center justify-center">
						<div className="relative">
							<svg className="w-32 h-32 transform -rotate-90">
								<circle
									cx="64"
									cy="64"
									r="56"
									stroke="currentColor"
									strokeWidth="8"
									fill="none"
									className="text-gray-200 dark:text-gray-700"
								/>
								<circle
									cx="64"
									cy="64"
									r="56"
									stroke="currentColor"
									strokeWidth="8"
									fill="none"
									strokeDasharray={`${2 * Math.PI * 56}`}
									strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
									className={getScoreRing()}
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="text-center">
									<div className={`text-3xl font-bold ${getScoreColor()}`}>
										{score}
									</div>
									<div className="text-xs text-muted-foreground">CV Score</div>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-4 flex items-center justify-center gap-2">
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							{suggestions.filter((s) => s.type === "error" || s.type === "warning").length}{" "}
							improvements available
						</span>
					</div>
				</div>

				{/* Suggestions List */}
				<ScrollArea className="flex-1 p-4">
					<AnimatePresence>
						<div className="space-y-3">
							{suggestions.map((suggestion, index) => (
								<motion.div
									key={suggestion.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card className="p-3 hover:shadow-md transition-shadow">
										<div className="flex items-start gap-3">
											<div className="mt-0.5">{getTypeIcon(suggestion.type)}</div>
											<div className="flex-1">
												<Badge variant="outline" className="mb-2 text-xs">
													{suggestion.category}
												</Badge>
												<p className="text-sm text-muted-foreground">
													{suggestion.message}
												</p>
												{suggestion.action && (
													<Button
														variant="link"
														size="sm"
														className="mt-2 p-0 h-auto"
														onClick={suggestion.action}
													>
														{suggestion.actionLabel}
														<ChevronRight className="ml-1 h-3 w-3" />
													</Button>
												)}
											</div>
										</div>
									</Card>
								</motion.div>
							))}
						</div>
					</AnimatePresence>
				</ScrollArea>
			</Card>
		</motion.div>
	);
}
