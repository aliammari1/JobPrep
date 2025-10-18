"use client";

import { useCVStore } from "@/store/cv-store";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function TemplateSelector() {
	const { settings, updateSettings } = useCVStore();

	const templates = [
		{ id: "modern", name: "Modern", description: "Two-column with colored headers" },
		{ id: "classic", name: "Classic", description: "Traditional centered layout" },
		{ id: "minimal", name: "Minimal", description: "Clean with lots of whitespace" },
		{ id: "creative", name: "Creative", description: "Bold and unique design" },
		{ id: "professional", name: "Professional", description: "Corporate standard" },
	];

	return (
		<Card className="p-4">
			<h3 className="mb-3 font-semibold">Template</h3>
			<RadioGroup
				value={settings.template}
				onValueChange={(value) => updateSettings({ template: value as any })}
			>
				{templates.map((template) => (
					<div key={template.id} className="flex items-center space-x-2">
						<RadioGroupItem value={template.id} id={template.id} />
						<Label htmlFor={template.id} className="cursor-pointer">
							<div>
								<p className="font-medium">{template.name}</p>
								<p className="text-xs text-muted-foreground">{template.description}</p>
							</div>
						</Label>
					</div>
				))}
			</RadioGroup>

			<div className="mt-4">
				<Label htmlFor="colorScheme" className="mb-2 block">
					Accent Color
				</Label>
				<input
					id="colorScheme"
					type="color"
					value={settings.colorScheme}
					onChange={(e) => updateSettings({ colorScheme: e.target.value })}
					className="h-10 w-full cursor-pointer rounded border"
				/>
			</div>
		</Card>
	);
}
