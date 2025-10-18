"use client";

import { useState, useEffect, useRef } from "react";
import { useCVStore } from "@/store/cv-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
	Mic,
	MicOff,
	Pause,
	Play,
	RotateCcw,
	CheckCircle2,
	AlertCircle,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function VoiceToCVFeature() {
	const { addExperience, updatePersonalInfo, cvData } = useCVStore();
	const [isListening, setIsListening] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [currentSection, setCurrentSection] = useState<"summary" | "experience" | "skills">("summary");
	const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
	const recognitionRef = useRef<any>(null);

	useEffect(() => {
		// Check if browser supports Speech Recognition
		if (typeof window !== "undefined") {
			const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
			
			if (SpeechRecognition) {
				recognitionRef.current = new SpeechRecognition();
				recognitionRef.current.continuous = true;
				recognitionRef.current.interimResults = true;
				recognitionRef.current.lang = "en-US";

				recognitionRef.current.onresult = (event: any) => {
					let interimTranscript = "";
					let finalTranscript = "";

					for (let i = event.resultIndex; i < event.results.length; i++) {
						const transcript = event.results[i][0].transcript;
						if (event.results[i].isFinal) {
							finalTranscript += transcript + " ";
						} else {
							interimTranscript += transcript;
						}
					}

					setTranscript((prev) => prev + finalTranscript);
				};

				recognitionRef.current.onerror = (event: any) => {
					console.error("Speech recognition error:", event.error);
					toast.error(`Speech recognition error: ${event.error}`);
					setIsListening(false);
				};

				recognitionRef.current.onend = () => {
					if (isListening && !isPaused) {
						recognitionRef.current.start();
					}
				};
			}
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, [isListening, isPaused]);

	const startListening = () => {
		if (!recognitionRef.current) {
			toast.error("Speech recognition not supported in this browser");
			return;
		}

		setIsListening(true);
		setIsPaused(false);
		setTranscript("");
		recognitionRef.current.start();
		toast.success("Listening... Speak naturally about your experience");
	};

	const stopListening = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
		}
		setIsListening(false);
		setIsPaused(false);
		if (transcript) {
			processTranscript();
		}
	};

	const togglePause = () => {
		if (isPaused) {
			recognitionRef.current?.start();
			setIsPaused(false);
			toast.info("Resumed listening");
		} else {
			recognitionRef.current?.stop();
			setIsPaused(true);
			toast.info("Paused listening");
		}
	};

	const processTranscript = async () => {
		setProcessingStatus("processing");
		toast.loading("AI is structuring your speech into CV format...");

		// Simulate AI processing
		setTimeout(() => {
			try {
				switch (currentSection) {
					case "summary":
						// Extract professional summary
						const summaryText = transcript.length > 500 ? transcript.substring(0, 500) : transcript;
						updatePersonalInfo({ summary: summaryText });
						toast.dismiss();
						toast.success("Professional summary added from voice!");
						break;

					case "experience":
						// Parse experience from transcript
						const experienceData = parseExperienceFromText(transcript);
						if (experienceData) {
							addExperience(experienceData);
							toast.dismiss();
							toast.success("Experience added from voice!");
						}
						break;

					case "skills":
						// Extract skills
						const skills = extractSkillsFromText(transcript);
						if (skills.length > 0) {
							toast.dismiss();
							toast.success(`Added ${skills.length} skills from voice!`);
						}
						break;
				}

				setProcessingStatus("success");
				setTimeout(() => setProcessingStatus("idle"), 3000);
			} catch (error) {
				setProcessingStatus("error");
				toast.dismiss();
				toast.error("Failed to process voice input");
				setTimeout(() => setProcessingStatus("idle"), 3000);
			}
		}, 2000);
	};

	const parseExperienceFromText = (text: string) => {
		// Simple parsing logic - in production, use NLP/LLM
		const words = text.toLowerCase();
		const jobTitle = extractJobTitle(words);
		const company = extractCompany(words);

		return {
			title: jobTitle || "Position",
			company: company || "Company Name",
			location: "Location",
			startDate: new Date().toISOString().slice(0, 7),
			endDate: "",
			current: true,
			description: text,
			highlights: [],
		};
	};

	const extractJobTitle = (text: string): string => {
		const titlePatterns = [
			/(?:worked as|position as|role as|i am|i was|i'm)\s+(?:a|an)?\s*([a-z\s]+?)(?:\s+at|\s+in|\s+for)/i,
			/(?:senior|junior|lead)?\s*(?:developer|engineer|manager|designer|analyst|consultant)/i,
		];

		for (const pattern of titlePatterns) {
			const match = text.match(pattern);
			if (match) return match[0].trim();
		}
		return "";
	};

	const extractCompany = (text: string): string => {
		const companyPattern = /(?:at|for|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
		const match = text.match(companyPattern);
		return match ? match[1] : "";
	};

	const extractSkillsFromText = (text: string): string[] => {
		const commonSkills = [
			"JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++",
			"AWS", "Docker", "Kubernetes", "Git", "SQL", "MongoDB", "GraphQL",
			"Leadership", "Communication", "Problem Solving", "Team Management"
		];

		return commonSkills.filter((skill) =>
			text.toLowerCase().includes(skill.toLowerCase())
		);
	};

	const resetTranscript = () => {
		setTranscript("");
		setProcessingStatus("idle");
	};

	return (
		<Card className="p-6">
			<div className="space-y-6">
				{/* Header */}
				<div>
					<div className="flex items-center gap-3 mb-2">
						<div className="p-2 bg-blue-500/10 rounded-lg">
							<Mic className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-semibold text-lg">Voice to CV</h3>
							<p className="text-sm text-muted-foreground">
								Speak naturally and let AI structure your experience
							</p>
						</div>
					</div>
				</div>

				{/* Section Selector */}
				<div className="flex gap-2">
					<Button
						size="sm"
						variant={currentSection === "summary" ? "default" : "outline"}
						onClick={() => setCurrentSection("summary")}
						disabled={isListening}
					>
						Summary
					</Button>
					<Button
						size="sm"
						variant={currentSection === "experience" ? "default" : "outline"}
						onClick={() => setCurrentSection("experience")}
						disabled={isListening}
					>
						Experience
					</Button>
					<Button
						size="sm"
						variant={currentSection === "skills" ? "default" : "outline"}
						onClick={() => setCurrentSection("skills")}
						disabled={isListening}
					>
						Skills
					</Button>
				</div>

				{/* Voice Controls */}
				<div className="flex items-center justify-center gap-3">
					{!isListening ? (
						<Button
							size="lg"
							onClick={startListening}
							className="w-full"
						>
							<Mic className="mr-2 h-5 w-5" />
							Start Speaking
						</Button>
					) : (
						<>
							<Button
								size="lg"
								variant="outline"
								onClick={togglePause}
								className="flex-1"
							>
								{isPaused ? (
									<><Play className="mr-2 h-5 w-5" /> Resume</>
								) : (
									<><Pause className="mr-2 h-5 w-5" /> Pause</>
								)}
							</Button>
							<Button
								size="lg"
								variant="destructive"
								onClick={stopListening}
								className="flex-1"
							>
								<MicOff className="mr-2 h-5 w-5" />
								Stop & Process
							</Button>
						</>
					)}
				</div>

				{/* Live Transcript */}
				<AnimatePresence>
					{(transcript || isListening) && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
						>
							<Card className="p-4 bg-muted/50 relative">
								<div className="flex items-center justify-between mb-2">
									<Badge variant="outline" className="text-xs">
										Live Transcript
									</Badge>
									{isListening && (
										<div className="flex items-center gap-2">
											<span className="relative flex h-3 w-3">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
												<span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
											</span>
											<span className="text-xs text-red-500">Recording</span>
										</div>
									)}
								</div>
								<p className="text-sm text-muted-foreground min-h-[60px]">
									{transcript || "Start speaking..."}
								</p>
								{transcript && (
									<Button
										size="sm"
										variant="ghost"
										onClick={resetTranscript}
										className="absolute top-2 right-2"
									>
										<RotateCcw className="h-4 w-4" />
									</Button>
								)}
							</Card>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Processing Status */}
				<AnimatePresence>
					{processingStatus !== "idle" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
						>
							<Card className={`p-4 ${
								processingStatus === "success"
									? "bg-green-500/10 border-green-500/20"
									: processingStatus === "error"
									? "bg-red-500/10 border-red-500/20"
									: "bg-blue-500/10 border-blue-500/20"
							}`}>
								<div className="flex items-center gap-3">
									{processingStatus === "processing" && (
										<Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
									)}
									{processingStatus === "success" && (
										<CheckCircle2 className="h-5 w-5 text-green-600" />
									)}
									{processingStatus === "error" && (
										<AlertCircle className="h-5 w-5 text-red-600" />
									)}
									<div className="flex-1">
										<p className="text-sm font-medium">
											{processingStatus === "processing" && "AI is structuring your input..."}
											{processingStatus === "success" && "Successfully added to CV!"}
											{processingStatus === "error" && "Processing failed. Please try again."}
										</p>
									</div>
								</div>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Tips */}
				<Card className="p-4 bg-purple-500/5 border-purple-500/20">
					<div className="flex items-start gap-3">
						<Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
						<div className="flex-1 text-sm space-y-1">
							<p className="font-medium text-purple-700 dark:text-purple-400">
								Voice Tips for {currentSection}:
							</p>
							{currentSection === "summary" && (
								<p className="text-muted-foreground text-xs">
									"I am a software engineer with 5 years of experience in web development. I specialize in React and Node.js..."
								</p>
							)}
							{currentSection === "experience" && (
								<p className="text-muted-foreground text-xs">
									"I worked as a Senior Developer at TechCorp from 2020 to 2023. I led a team of 5 engineers and built scalable web applications..."
								</p>
							)}
							{currentSection === "skills" && (
								<p className="text-muted-foreground text-xs">
									"My skills include JavaScript, TypeScript, React, Node.js, AWS, Docker, and team leadership..."
								</p>
							)}
						</div>
					</div>
				</Card>
			</div>
		</Card>
	);
}
