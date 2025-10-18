"use client";

import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function EducationSection() {
	const { cvData, addEducation, updateEducation, removeEducation } = useCVStore();
	const { education } = cvData;

	const handleAdd = () => {
		addEducation({
			degree: "",
			institution: "",
			location: "",
			startDate: "",
			endDate: "",
			gpa: "",
			description: "",
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Education</h3>
				<Button onClick={handleAdd} size="sm">
					<Plus className="mr-2 h-4 w-4" />
					Add Education
				</Button>
			</div>

			{education.length === 0 ? (
				<Card className="p-8 text-center">
					<p className="text-muted-foreground">No education added yet. Click "Add Education" to start.</p>
				</Card>
			) : (
				<div className="space-y-4">
					{education.map((edu) => (
						<Card key={edu.id} className="p-4">
							<div className="space-y-4">
								<div className="flex items-start justify-between">
									<h4 className="font-semibold">Education Entry</h4>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeEducation(edu.id)}
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<Label>Degree *</Label>
										<Input
											value={edu.degree}
											onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
											placeholder="Bachelor of Science in Computer Science"
										/>
									</div>

									<div>
										<Label>Institution *</Label>
										<Input
											value={edu.institution}
											onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
											placeholder="University of California"
										/>
									</div>

									<div>
										<Label>Location</Label>
										<Input
											value={edu.location}
											onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
											placeholder="Berkeley, CA"
										/>
									</div>

									<div>
										<Label>GPA</Label>
										<Input
											value={edu.gpa}
											onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
											placeholder="3.8/4.0"
										/>
									</div>

									<div>
										<Label>Start Date</Label>
										<Input
											type="month"
											value={edu.startDate}
											onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
										/>
									</div>

									<div>
										<Label>End Date</Label>
										<Input
											type="month"
											value={edu.endDate}
											onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
										/>
									</div>
								</div>

								<div>
									<Label>Description (Optional)</Label>
									<Textarea
										value={edu.description}
										onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
										placeholder="Additional details, achievements, coursework..."
										rows={3}
									/>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
