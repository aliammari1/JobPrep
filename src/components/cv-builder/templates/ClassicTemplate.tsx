"use client";

import { CVData, CVSettings } from "@/store/cv-store";

interface TemplateProps {
	cvData: CVData;
	settings: CVSettings;
}

export function ClassicTemplate({ cvData, settings }: TemplateProps) {
	const { personalInfo, experience, education, skills, projects, certifications, languages, awards } = cvData;

	return (
		<div className="min-h-[297mm] bg-white p-12 text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
			{/* Header - Classic Centered */}
			<div className="mb-8 border-b-2 border-gray-800 pb-6 text-center">
				<h1 className="mb-2 text-3xl font-bold uppercase tracking-wide">
					{personalInfo.fullName || "Your Name"}
				</h1>
				<p className="mb-3 text-lg italic text-gray-700">{personalInfo.title || "Professional Title"}</p>

				<div className="text-sm text-gray-600">
					{personalInfo.email && <span>{personalInfo.email}</span>}
					{personalInfo.phone && <span> • {personalInfo.phone}</span>}
					{personalInfo.location && <span> • {personalInfo.location}</span>}
				</div>
			</div>

			{/* Summary */}
			{personalInfo.summary && (
				<div className="mb-6">
					<h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
						Summary
					</h2>
					<p className="text-sm leading-relaxed text-gray-700">{personalInfo.summary}</p>
				</div>
			)}

			{/* Experience */}
            {experience.length > 0 && (
                <div className="mb-6">
                    <h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
                        Professional Experience
                    </h2>
                    <div className="space-y-4">
                        {experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="mb-1">
                                    <h3 className="inline font-bold">{exp.title}</h3>
                                    <span className="mx-2">•</span>
                                    <span className="italic">{exp.company}</span>
                                </div>
                                <div className="mb-2 text-sm text-gray-600">
                                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                    {exp.location && <span> • {exp.location}</span>}
                                </div>
                                {exp.description && exp.description.length > 0 && (
                                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                        {exp.description.map((bullet: string, idx: number) => (
                                            <li key={idx}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

			{/* Education */}
			{education.length > 0 && (
				<div className="mb-6">
					<h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
						Education
					</h2>
					<div className="space-y-3">
						{education.map((edu) => (
							<div key={edu.id}>
								<h3 className="font-bold">{edu.degree}</h3>
								<p className="text-sm italic text-gray-600">{edu.institution}</p>
								<p className="text-sm text-gray-600">
									{edu.startDate} - {edu.endDate}
									{edu.gpa && <span> • GPA: {edu.gpa}</span>}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Skills */}
			{skills.length > 0 && (
				<div className="mb-6">
					<h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
						Skills
					</h2>
					<div className="space-y-1">
						{skills.map((skill) => (
							<p key={skill.id} className="text-sm">
								<span className="font-semibold">{skill.category}:</span> {skill.items.join(", ")}
							</p>
						))}
					</div>
				</div>
			)}

			{/* Additional Sections */}
			
            {/* Projects */}
            {projects.length > 0 && (
                <div className="mb-6">
                    <h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
                        Projects
                    </h2>
                    <div className="space-y-2">
                        {projects.map((proj) => (
                            <div key={proj.id}>
                                <h3 className="font-semibold">{proj.name}</h3>
                                {proj.description && proj.description.length > 0 && (
                                    <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-gray-700">
                                        {proj.description.map((bullet: string, idx: number) => (
                                            <li key={idx}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        <span className="font-semibold">Technologies:</span> {proj.technologies.join(", ")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

			{certifications.length > 0 && (
				<div className="mb-6">
					<h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
						Certifications
					</h2>
					<div className="space-y-1">
						{certifications.map((cert) => (
							<p key={cert.id} className="text-sm">
								<span className="font-semibold">{cert.name}</span> - {cert.issuer} ({cert.date})
							</p>
						))}
					</div>
				</div>
			)}

			{languages.length > 0 && (
				<div className="mb-6">
					<h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
						Languages
					</h2>
					<p className="text-sm">
						{languages.map((lang, idx) => (
							<span key={lang.id}>
								{lang.language} ({lang.proficiency})
								{idx < languages.length - 1 && " • "}
							</span>
						))}
					</p>
				</div>
			)}

			{awards.length > 0 && (
				<div className="mb-6">
					<h2 className="mb-3 border-b border-gray-300 pb-1 text-lg font-bold uppercase tracking-wide">
						Awards & Honors
					</h2>
					<div className="space-y-1">
						{awards.map((award) => (
							<p key={award.id} className="text-sm">
								<span className="font-semibold">{award.title}</span> - {award.issuer} ({award.date})
							</p>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
