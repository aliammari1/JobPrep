"use client";

import { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Palette, Type, Layers, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CustomizePanel() {
	const { settings, updateSettings } = useCVStore();
	const [isOpen, setIsOpen] = useState(false);

	const colorPresets = [
		{ name: "Blue", value: "#3b82f6" },
		{ name: "Purple", value: "#8b5cf6" },
		{ name: "Green", value: "#10b981" },
		{ name: "Red", value: "#ef4444" },
		{ name: "Orange", value: "#f59e0b" },
		{ name: "Pink", value: "#ec4899" },
		{ name: "Teal", value: "#14b8a6" },
		{ name: "Gray", value: "#6b7280" },
	];

	const templates = [
		{ id: "modern", name: "Modern", description: "Clean and contemporary design" },
		{ id: "classic", name: "Classic", description: "Traditional professional look" },
		{ id: "minimal", name: "Minimal", description: "Simple and elegant" },
	];

	const fonts = [
		{ id: "inter", name: "Inter", style: "font-sans" },
		{ id: "serif", name: "Georgia", style: "font-serif" },
		{ id: "mono", name: "Roboto Mono", style: "font-mono" },
	];

	const spacingOptions = [
		{ id: "compact", name: "Compact", description: "Tight spacing, fits more content" },
		{ id: "normal", name: "Normal", description: "Balanced spacing" },
		{ id: "relaxed", name: "Relaxed", description: "Generous spacing, easier to read" },
	];

	const sections = [
		{ id: "experience", name: "Experience", enabled: true },
		{ id: "education", name: "Education", enabled: true },
		{ id: "skills", name: "Skills", enabled: true },
		{ id: "projects", name: "Projects", enabled: true },
		{ id: "certifications", name: "Certifications", enabled: true },
		{ id: "languages", name: "Languages", enabled: true },
		{ id: "awards", name: "Awards", enabled: true },
	];

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Palette className="mr-2 h-4 w-4" />
					Customize
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Customize Your Resume</DialogTitle>
					<DialogDescription>
						Personalize your resume's appearance and layout
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="template" className="mt-4">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="template">
							<Layers className="mr-2 h-4 w-4" />
							Template
						</TabsTrigger>
						<TabsTrigger value="colors">
							<Palette className="mr-2 h-4 w-4" />
							Colors
						</TabsTrigger>
						<TabsTrigger value="typography">
							<Type className="mr-2 h-4 w-4" />
							Typography
						</TabsTrigger>
						<TabsTrigger value="sections">
							<Eye className="mr-2 h-4 w-4" />
							Sections
						</TabsTrigger>
					</TabsList>

					{/* Template Tab */}
					<TabsContent value="template" className="space-y-4 mt-6">
						<RadioGroup
							value={settings.template}
							onValueChange={(value) =>
								updateSettings({
									template: value as typeof settings.template,
								})
							}
						>
							<div className="grid gap-4">
								{templates.map((template) => (
									<Card
										key={template.id}
										className={`p-4 cursor-pointer transition-all ${
											settings.template === template.id
												? "ring-2 ring-primary shadow-md"
												: "hover:shadow-sm"
										}`}
										onClick={() =>
											updateSettings({
												template: template.id as typeof settings.template,
											})
										}
									>
										<div className="flex items-start gap-4">
											<RadioGroupItem value={template.id} id={template.id} />
											<div className="flex-1">
												<Label htmlFor={template.id} className="font-semibold cursor-pointer">
													{template.name}
												</Label>
												<p className="text-sm text-muted-foreground mt-1">
													{template.description}
												</p>
											</div>
											<div className="w-32 h-24 bg-muted rounded border flex items-center justify-center text-muted-foreground text-xs">
												Preview
											</div>
										</div>
									</Card>
								))}
							</div>
						</RadioGroup>
					</TabsContent>

					{/* Colors Tab */}
					<TabsContent value="colors" className="space-y-6 mt-6">
						<div>
							<Label className="text-base mb-4 block">Primary Color</Label>
							<div className="grid grid-cols-4 gap-3">
								{colorPresets.map((color) => (
									<button
										key={color.value}
										onClick={() => updateSettings({ colorScheme: color.value })}
										className={`group relative h-20 rounded-lg border-2 transition-all ${
											settings.colorScheme === color.value
												? "border-primary ring-2 ring-primary/20"
												: "border-transparent hover:border-gray-300"
										}`}
										style={{ backgroundColor: color.value }}
									>
										<div className="absolute inset-0 flex items-center justify-center">
											<span className="text-white font-medium text-sm drop-shadow-md">
												{color.name}
											</span>
										</div>
									</button>
								))}
							</div>
						</div>

						<div>
							<Label className="text-base mb-4 block">Custom Color</Label>
							<div className="flex items-center gap-4">
								<input
									type="color"
									value={settings.colorScheme}
									onChange={(e) => updateSettings({ colorScheme: e.target.value })}
									className="h-12 w-24 rounded border cursor-pointer"
								/>
								<div>
									<div className="text-sm font-medium">{settings.colorScheme}</div>
									<div className="text-xs text-muted-foreground">
										Click to choose custom color
									</div>
								</div>
							</div>
						</div>
					</TabsContent>

					{/* Typography Tab */}
					<TabsContent value="typography" className="space-y-6 mt-6">
						<div>
							<Label className="text-base mb-4 block">Font Family</Label>
							<RadioGroup
								value="inter"
								onValueChange={(value) => console.log("Font changed:", value)}
							>
								<div className="grid gap-3">
									{fonts.map((font) => (
										<Card
											key={font.id}
											className="p-4 cursor-pointer hover:shadow-sm transition-all"
										>
											<div className="flex items-center gap-4">
												<RadioGroupItem value={font.id} id={font.id} />
												<Label
													htmlFor={font.id}
													className={`font-semibold cursor-pointer flex-1 ${font.style}`}
												>
													{font.name}
												</Label>
												<span className={`text-2xl ${font.style}`}>Aa</span>
											</div>
										</Card>
									))}
								</div>
							</RadioGroup>
						</div>

						<div>
							<Label className="text-base mb-4 block">Font Size</Label>
							<RadioGroup
								value={settings.fontSize}
								onValueChange={(value) =>
									updateSettings({
										fontSize: value as typeof settings.fontSize,
									})
								}
							>
								<div className="grid gap-3">
									<Card className="p-4">
										<div className="flex items-center gap-4">
											<RadioGroupItem value="small" id="small" />
											<Label htmlFor="small" className="cursor-pointer flex-1">
												Small
											</Label>
											<span className="text-sm">Perfect for detailed resumes</span>
										</div>
									</Card>
									<Card className="p-4">
										<div className="flex items-center gap-4">
											<RadioGroupItem value="medium" id="medium" />
											<Label htmlFor="medium" className="cursor-pointer flex-1">
												Medium
											</Label>
											<span className="text-base">Recommended for most cases</span>
										</div>
									</Card>
									<Card className="p-4">
										<div className="flex items-center gap-4">
											<RadioGroupItem value="large" id="large" />
											<Label htmlFor="large" className="cursor-pointer flex-1">
												Large
											</Label>
											<span className="text-lg">Easy to read, uses more space</span>
										</div>
									</Card>
								</div>
							</RadioGroup>
						</div>

						<div>
							<Label className="text-base mb-4 block">Line Spacing</Label>
							<RadioGroup
								value={settings.spacing}
								onValueChange={(value) =>
									updateSettings({
										spacing: value as typeof settings.spacing,
									})
								}
							>
								<div className="grid gap-3">
									{spacingOptions.map((option) => (
										<Card
											key={option.id}
											className={`p-4 cursor-pointer transition-all ${
												settings.spacing === option.id ? "ring-2 ring-primary" : "hover:shadow-sm"
											}`}
											onClick={() =>
												updateSettings({
													spacing: option.id as typeof settings.spacing,
												})
											}
										>
											<div className="flex items-center gap-4">
												<RadioGroupItem value={option.id} id={option.id} />
												<div className="flex-1">
													<Label htmlFor={option.id} className="font-semibold cursor-pointer">
														{option.name}
													</Label>
													<p className="text-sm text-muted-foreground">{option.description}</p>
												</div>
											</div>
										</Card>
									))}
								</div>
							</RadioGroup>
						</div>
					</TabsContent>

					{/* Sections Tab */}
					<TabsContent value="sections" className="space-y-6 mt-6">
						<div>
							<div className="flex items-center justify-between mb-4">
								<Label className="text-base">Show Profile Photo</Label>
								<Switch
									checked={settings.showPhoto}
									onCheckedChange={(checked) => updateSettings({ showPhoto: checked })}
								/>
							</div>
							<p className="text-sm text-muted-foreground">
								Display your profile photo at the top of your resume
							</p>
						</div>

						<div>
							<Label className="text-base mb-4 block">Section Visibility</Label>
							<div className="space-y-3">
								{sections.map((section) => (
									<Card key={section.id} className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												{section.enabled ? (
													<Eye className="h-5 w-5 text-primary" />
												) : (
													<EyeOff className="h-5 w-5 text-muted-foreground" />
												)}
												<Label className="font-medium">{section.name}</Label>
											</div>
											<Switch
												checked={section.enabled}
												onCheckedChange={(checked) => {
													// TODO: Implement section visibility toggle
													console.log(`Toggle ${section.id}:`, checked);
												}}
											/>
										</div>
									</Card>
								))}
							</div>
						</div>

						<div>
							<Label className="text-base mb-4 block">Section Order</Label>
							<p className="text-sm text-muted-foreground mb-4">
								Use drag & drop in the editor panel to reorder sections
							</p>
							<Card className="p-4 bg-muted/50">
								<div className="space-y-2 text-sm">
									{settings.sectionOrder.map((section, index) => (
										<div key={section} className="flex items-center gap-2">
											<span className="text-muted-foreground">{index + 1}.</span>
											<span className="capitalize">{section}</span>
										</div>
									))}
								</div>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Close
					</Button>
					<Button onClick={() => setIsOpen(false)}>Apply Changes</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
