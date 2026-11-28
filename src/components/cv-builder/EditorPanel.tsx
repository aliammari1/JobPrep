"use client";

import { useState } from "react";
import styles from "./cv-workspace.module.css";
import { AwardsSection } from "./sections/AwardsSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { EducationSection } from "./sections/EducationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";

const sections = [
  {
    id: "personal",
    label: "Personal information",
    Component: PersonalInfoSection,
  },
  { id: "experience", label: "Experience", Component: ExperienceSection },
  { id: "education", label: "Education", Component: EducationSection },
  { id: "skills", label: "Skills", Component: SkillsSection },
  { id: "projects", label: "Projects", Component: ProjectsSection },
  { id: "certs", label: "Certifications", Component: CertificationsSection },
  { id: "languages", label: "Languages", Component: LanguagesSection },
  { id: "awards", label: "Awards", Component: AwardsSection },
];

export function EditorPanel() {
  const [section, setSection] = useState("personal");
  const { Component } =
    sections.find(({ id }) => id === section) ?? sections[0];

  return (
    <div className={styles.editorContent}>
      <label className={styles.sectionPicker}>
        <span id="cv-section-label">Section</span>
        <select
          aria-labelledby="cv-section-label"
          value={section}
          onChange={(event) => setSection(event.target.value)}
        >
          {sections.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.formFields}>
        <Component />
      </div>
    </div>
  );
}
