"use client";

import { CVData, CVSettings } from "@/store/cv-store";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import Image from "next/image";

interface TemplateProps {
  cvData: CVData;
  settings: CVSettings;
}

export function ModernTemplate({ cvData, settings }: TemplateProps) {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    awards,
  } = cvData;

  return (
    <div
      className="min-h-[297mm] bg-white p-12 text-gray-900"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div
        className="mb-8 border-b-4 pb-6 flex gap-6"
        style={{ borderColor: settings.colorScheme }}
      >
        {/* Profile Photo */}
        {personalInfo.photo && (
          <div className="flex-shrink-0">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden border-4"
              style={{ borderColor: settings.colorScheme }}
            >
              <Image
                src={personalInfo.photo}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <h1
            className="mb-2 text-4xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            {personalInfo.fullName || "Your Name"}
          </h1>
          <p className="mb-4 text-xl text-gray-600">
            {personalInfo.title || "Professional Title"}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {personalInfo.location}
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                GitHub
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Website
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{exp.title}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </p>
                    <p>{exp.location}</p>
                  </div>
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-700">
                    {exp.description}
                  </p>
                )}
                {exp.highlights.length > 0 && (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
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
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>
                    {edu.startDate} - {edu.endDate}
                  </p>
                  <p>{edu.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Skills
          </h2>
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.id}>
                <p className="text-sm">
                  <span className="font-semibold">{skill.category}:</span>{" "}
                  {skill.items.join(" • ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-bold">{project.name}</h3>
                <p className="text-sm text-gray-700">{project.description}</p>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-semibold">Technologies:</span>{" "}
                  {project.technologies.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <div>
                  <p className="font-semibold">{cert.name}</p>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                </div>
                <p className="text-sm text-gray-600">{cert.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <div key={lang.id} className="text-sm">
                <span className="font-semibold">{lang.language}</span> -{" "}
                <span className="text-gray-600 capitalize">
                  {lang.proficiency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xl font-bold"
            style={{ color: settings.colorScheme }}
          >
            Awards & Honors
          </h2>
          <div className="space-y-2">
            {awards.map((award) => (
              <div key={award.id} className="flex justify-between">
                <div>
                  <p className="font-semibold">{award.title}</p>
                  <p className="text-sm text-gray-600">{award.issuer}</p>
                </div>
                <p className="text-sm text-gray-600">{award.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
