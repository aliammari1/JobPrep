"use client";

import { CVData, CVSettings } from "@/store/cv-store";

interface TemplateProps {
	cvData: CVData;
	settings: CVSettings;
}

export function MinimalTemplate({ cvData, settings }: TemplateProps) {
	const { personalInfo, experience, education, skills, projects, certifications, languages, awards } = cvData;

	return (
		<div className="min-h-[297mm] bg-white p-16 text-gray-800" style={{ fontFamily: "Helvetica, sans-serif" }}>
			{/* Header - Minimal */}
			<div className="mb-10">
				<h1 className="mb-1 text-5xl font-light">{personalInfo.fullName || "Your Name"}</h1>
				<p className="mb-6 text-base font-light text-gray-600">{personalInfo.title || "Professional Title"}</p>

				<div className="space-y-1 text-sm font-light text-gray-600">
					{personalInfo.email && <p>{personalInfo.email}</p>}
					{personalInfo.phone && <p>{personalInfo.phone}</p>}
					{personalInfo.location && <p>{personalInfo.location}</p>}
				</div>
			</div>

			{/* Summary */}
			{personalInfo.summary && (
				<div className="mb-8">
					<p className="text-sm font-light leading-relaxed">{personalInfo.summary}</p>
				</div>
			)}

			{/* Experience */}
			{experience.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
						Experience
					</h2>
					<div className="space-y-5">
						{experience.map((exp) => (
							<div key={exp.id}>
								<h3 className="font-medium">{exp.title}</h3>
								<p className="text-sm text-gray-600">{exp.company}</p>
								<p className="text-xs text-gray-500">
									{exp.startDate} — {exp.current ? "Present" : exp.endDate}
								</p>
								{exp.description && (
									<p className="mt-2 text-sm font-light leading-relaxed">{exp.description}</p>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Education */}
			{education.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
						Education
					</h2>
					<div className="space-y-4">
						{education.map((edu) => (
							<div key={edu.id}>
								<h3 className="font-medium">{edu.degree}</h3>
								<p className="text-sm text-gray-600">{edu.institution}</p>
								<p className="text-xs text-gray-500">
									{edu.startDate} — {edu.endDate}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Skills */}
			{skills.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Skills</h2>
					<div className="space-y-2">
						{skills.map((skill) => (
							<p key={skill.id} className="text-sm font-light">
								{skill.items.join(" • ")}
							</p>
						))}
					</div>
				</div>
			)}

			{/* Projects */}
			{projects.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
						Projects
					</h2>
					<div className="space-y-3">
						{projects.map((proj) => (
							<div key={proj.id}>
								<h3 className="font-medium">{proj.name}</h3>
								<p className="text-sm font-light">{proj.description}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Certifications */}
			{certifications.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
						Certifications
					</h2>
					<div className="space-y-2">
						{certifications.map((cert) => (
							<p key={cert.id} className="text-sm font-light">
								{cert.name} — {cert.issuer}
							</p>
						))}
					</div>
				</div>
			)}

			{/* Languages */}
			{languages.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
						Languages
					</h2>
					<p className="text-sm font-light">
						{languages.map((lang, idx) => (
							<span key={lang.id}>
								{lang.language}
								{idx < languages.length - 1 && " • "}
							</span>
						))}
					</p>
				</div>
			)}

			{/* Awards */}
			{awards.length > 0 && (
				<div className="mb-8">
					<h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Awards</h2>
					<div className="space-y-2">
						{awards.map((award) => (
							<p key={award.id} className="text-sm font-light">
								{award.title} — {award.issuer}
							</p>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
