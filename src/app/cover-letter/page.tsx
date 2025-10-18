"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Sparkles, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function CoverLetterPage() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [letterData, setLetterData] = useState({
		recipientName: "",
		recipientTitle: "",
		companyName: "",
		jobTitle: "",
		jobDescription: "",
		yourName: "",
		yourContact: "",
		tone: "professional",
		customContent: "",
	});

	const handleGenerateLetter = async () => {
		setIsGenerating(true);
		try {
			const response = await fetch("/api/cover-letter/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(letterData),
			});

			if (!response.ok) throw new Error("Failed to generate letter");

			const data = await response.json();
			setLetterData({ ...letterData, customContent: data.content });

			toast.success("Your cover letter has been generated with AI!");
		} catch (error) {
			toast.error("Failed to generate cover letter. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownload = async () => {
		try {
			const response = await fetch("/api/cover-letter/download", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(letterData),
			});

			if (!response.ok) throw new Error("Failed to download");

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "cover-letter.pdf";
			a.click();

			toast.success("Your cover letter has been downloaded!");
		} catch (error) {
			toast.error("Failed to download cover letter.");
		}
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Cover Letter Generator</h1>
					<p className="text-muted-foreground">
						Create personalized cover letters with AI assistance
					</p>
				</div>

				<div className="flex gap-4">
					<Button onClick={handleGenerateLetter} disabled={isGenerating}>
						{isGenerating ? (
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<Sparkles className="w-4 h-4 mr-2" />
						)}
						Generate with AI
					</Button>
					<Button onClick={handleDownload} variant="outline">
						<Download className="w-4 h-4 mr-2" />
						Download PDF
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Letter Details</CardTitle>
						<CardDescription>Fill in the details for your cover letter</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Your Name</Label>
								<Input
									value={letterData.yourName}
									onChange={(e) =>
										setLetterData({ ...letterData, yourName: e.target.value })
									}
									placeholder="Your full name"
								/>
							</div>
							<div className="space-y-2">
								<Label>Your Contact</Label>
								<Input
									value={letterData.yourContact}
									onChange={(e) =>
										setLetterData({ ...letterData, yourContact: e.target.value })
									}
									placeholder="Email or phone"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Recipient Name</Label>
								<Input
									value={letterData.recipientName}
									onChange={(e) =>
										setLetterData({ ...letterData, recipientName: e.target.value })
									}
									placeholder="Hiring Manager Name"
								/>
							</div>
							<div className="space-y-2">
								<Label>Recipient Title</Label>
								<Input
									value={letterData.recipientTitle}
									onChange={(e) =>
										setLetterData({ ...letterData, recipientTitle: e.target.value })
									}
									placeholder="HR Manager, etc."
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Company Name</Label>
								<Input
									value={letterData.companyName}
									onChange={(e) =>
										setLetterData({ ...letterData, companyName: e.target.value })
									}
									placeholder="Company you're applying to"
								/>
							</div>
							<div className="space-y-2">
								<Label>Job Title</Label>
								<Input
									value={letterData.jobTitle}
									onChange={(e) =>
										setLetterData({ ...letterData, jobTitle: e.target.value })
									}
									placeholder="Position title"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Tone</Label>
							<Select
								value={letterData.tone}
								onValueChange={(value) => setLetterData({ ...letterData, tone: value })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="professional">Professional</SelectItem>
									<SelectItem value="enthusiastic">Enthusiastic</SelectItem>
									<SelectItem value="formal">Formal</SelectItem>
									<SelectItem value="creative">Creative</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Job Description (Optional)</Label>
							<Textarea
								value={letterData.jobDescription}
								onChange={(e) =>
									setLetterData({ ...letterData, jobDescription: e.target.value })
								}
								placeholder="Paste the job description here for better AI customization..."
								rows={4}
							/>
						</div>

						<div className="space-y-2">
							<Label>Generated Content</Label>
							<Textarea
								value={letterData.customContent}
								onChange={(e) =>
									setLetterData({ ...letterData, customContent: e.target.value })
								}
								placeholder="Your cover letter will appear here..."
								rows={12}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
