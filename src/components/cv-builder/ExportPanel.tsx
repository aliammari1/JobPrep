"use client";

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  CheckCircle2,
  FileDown,
  FileJson,
  FileText,
  FileType,
  Linkedin,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCVStore } from "@/store/cv-store";

type ExportFormat = "pdf" | "docx" | "json" | "txt" | "linkedin";

function toLines(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((line) => line.trim()).filter(Boolean);
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function sanitizeFileName(name: string): string {
  return (name || "CV").trim().replace(/\s+/g, "_");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const { cvData, settings } = useCVStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState(settings.template);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats: Array<{
    id: ExportFormat;
    name: string;
    icon: typeof FileDown;
    description: string;
    size: string;
    recommended: boolean;
  }> = [
    {
      id: "pdf",
      name: "PDF Document",
      icon: FileDown,
      description: "Print-ready PDF with your chosen template",
      size: "~200 KB",
      recommended: true,
    },
    {
      id: "docx",
      name: "Word Document (.docx)",
      icon: FileType,
      description: "Editable ATS-friendly DOCX file for Microsoft Word",
      size: "~50 KB",
      recommended: false,
    },
    {
      id: "json",
      name: "JSON Backup",
      icon: FileJson,
      description: "Complete data backup in JSON format",
      size: "~10 KB",
      recommended: false,
    },
    {
      id: "txt",
      name: "Plain Text",
      icon: FileText,
      description: "Simple text file without formatting",
      size: "~5 KB",
      recommended: false,
    },
    {
      id: "linkedin",
      name: "LinkedIn Profile",
      icon: Linkedin,
      description: "Copy-paste ready text for LinkedIn",
      size: "Clipboard",
      recommended: false,
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading(
      `Generating ${selectedFormat.toUpperCase()}...`,
    );

    try {
      switch (selectedFormat) {
        case "pdf":
          await exportPDF();
          break;
        case "docx":
          await exportDOCX();
          break;
        case "json":
          exportJSON();
          break;
        case "txt":
          exportTXT();
          break;
        case "linkedin":
          await exportLinkedIn();
          break;
      }
      toast.dismiss(loadingToast);
      if (selectedFormat === "linkedin") {
        toast.success("LinkedIn profile text copied to clipboard!");
      } else {
        toast.success(`${selectedFormat.toUpperCase()} exported successfully!`);
      }
      setIsOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Export failed. Please try again.");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    const res = await fetch("/api/cv/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cvData,
        template: selectedTemplate,
        colorScheme: settings.colorScheme,
      }),
    });

    if (!res.ok) throw new Error("PDF generation failed");

    const blob = await res.blob();
    triggerDownload(
      blob,
      `${sanitizeFileName(cvData.personalInfo.fullName)}_Resume.pdf`,
    );
  };

  const exportDOCX = async () => {
    const accentHex = (settings.colorScheme || "#2563EB").replace(/^#/, "");
    const darkHex = "111827";
    const mutedHex = "4B5563";
    const borderHex = "CBD5E1";

    const createSectionHeading = (title: string) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 100 },
        border: {
          bottom: {
            color: borderHex,
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            color: accentHex,
          }),
        ],
      });

    const sectionsChildren: Paragraph[] = [];
    const { personalInfo } = cvData;

    // Header: Full Name
    sectionsChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: personalInfo.fullName || "Your Name",
            bold: true,
            size: 36,
            color: darkHex,
          }),
        ],
      }),
    );

    // Header: Job Title
    if (personalInfo.title) {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: personalInfo.title,
              size: 24,
              color: accentHex,
              bold: true,
            }),
          ],
        }),
      );
    }

    // Header: Contact Details
    const contactParts = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
      personalInfo.linkedin,
      personalInfo.github,
      personalInfo.website,
      personalInfo.portfolio,
    ].filter(Boolean);

    if (contactParts.length > 0) {
      sectionsChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: contactParts.join("  |  "),
              size: 19,
              color: mutedHex,
            }),
          ],
        }),
      );
    }

    // Professional Summary
    if (personalInfo.summary?.trim()) {
      sectionsChildren.push(createSectionHeading("Professional Summary"));
      sectionsChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: personalInfo.summary.trim(),
              size: 21,
              color: darkHex,
            }),
          ],
        }),
      );
    }

    // Experience
    if (cvData.experience.length > 0) {
      sectionsChildren.push(createSectionHeading("Work Experience"));
      for (const exp of cvData.experience) {
        const dateRange = [exp.startDate, exp.current ? "Present" : exp.endDate]
          .filter(Boolean)
          .join(" - ");

        sectionsChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: exp.title || "Role",
                bold: true,
                size: 22,
                color: darkHex,
              }),
              ...(exp.company
                ? [
                    new TextRun({
                      text: `  —  ${exp.company}`,
                      bold: true,
                      size: 21,
                      color: mutedHex,
                    }),
                  ]
                : []),
            ],
          }),
        );

        const metaLine = [dateRange, exp.location]
          .filter(Boolean)
          .join("  |  ");
        if (metaLine) {
          sectionsChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: metaLine,
                  italics: true,
                  size: 19,
                  color: mutedHex,
                }),
              ],
            }),
          );
        }

        const bullets = [
          ...toLines(exp.description),
          ...toLines(exp.highlights),
        ];
        for (const bullet of bullets) {
          sectionsChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: bullet,
                  size: 20,
                  color: darkHex,
                }),
              ],
            }),
          );
        }
      }
    }

    // Education
    if (cvData.education.length > 0) {
      sectionsChildren.push(createSectionHeading("Education"));
      for (const edu of cvData.education) {
        const dateRange = [edu.startDate, edu.endDate]
          .filter(Boolean)
          .join(" - ");
        sectionsChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: edu.degree || "Degree",
                bold: true,
                size: 22,
                color: darkHex,
              }),
              ...(edu.institution
                ? [
                    new TextRun({
                      text: `  —  ${edu.institution}`,
                      size: 21,
                      color: mutedHex,
                    }),
                  ]
                : []),
            ],
          }),
        );

        const eduMeta = [
          dateRange,
          edu.location,
          edu.gpa ? `GPA: ${edu.gpa}` : "",
        ]
          .filter(Boolean)
          .join("  |  ");

        if (eduMeta) {
          sectionsChildren.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: eduMeta,
                  italics: true,
                  size: 19,
                  color: mutedHex,
                }),
              ],
            }),
          );
        }

        if (edu.description?.trim()) {
          sectionsChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: edu.description.trim(),
                  size: 20,
                  color: darkHex,
                }),
              ],
            }),
          );
        }
      }
    }

    // Skills
    if (cvData.skills.length > 0) {
      sectionsChildren.push(createSectionHeading("Skills"));
      for (const skill of cvData.skills) {
        if (!skill.category && skill.items.length === 0) continue;
        sectionsChildren.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              ...(skill.category
                ? [
                    new TextRun({
                      text: `${skill.category}: `,
                      bold: true,
                      size: 20,
                      color: darkHex,
                    }),
                  ]
                : []),
              new TextRun({
                text: skill.items.join(", "),
                size: 20,
                color: darkHex,
              }),
            ],
          }),
        );
      }
    }

    // Projects
    if (cvData.projects.length > 0) {
      sectionsChildren.push(createSectionHeading("Projects"));
      for (const proj of cvData.projects) {
        const links = [proj.url, proj.github].filter(Boolean).join("  |  ");
        sectionsChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: proj.name || "Project",
                bold: true,
                size: 22,
                color: darkHex,
              }),
              ...(links
                ? [
                    new TextRun({
                      text: `  (${links})`,
                      size: 18,
                      color: mutedHex,
                    }),
                  ]
                : []),
            ],
          }),
        );

        if (proj.technologies?.length > 0) {
          sectionsChildren.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: "Technologies: ",
                  bold: true,
                  size: 19,
                  color: mutedHex,
                }),
                new TextRun({
                  text: proj.technologies.join(", "),
                  italics: true,
                  size: 19,
                  color: mutedHex,
                }),
              ],
            }),
          );
        }

        for (const line of toLines(proj.description)) {
          sectionsChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: line,
                  size: 20,
                  color: darkHex,
                }),
              ],
            }),
          );
        }
      }
    }

    // Certifications
    if (cvData.certifications.length > 0) {
      sectionsChildren.push(createSectionHeading("Certifications"));
      for (const cert of cvData.certifications) {
        const details = [cert.issuer, cert.date, cert.url]
          .filter(Boolean)
          .join("  |  ");
        sectionsChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: cert.name,
                bold: true,
                size: 20,
                color: darkHex,
              }),
              ...(details
                ? [
                    new TextRun({
                      text: `  —  ${details}`,
                      size: 20,
                      color: mutedHex,
                    }),
                  ]
                : []),
            ],
          }),
        );
      }
    }

    // Languages
    if (cvData.languages.length > 0) {
      sectionsChildren.push(createSectionHeading("Languages"));
      const languageLine = cvData.languages
        .filter((l) => l.language)
        .map((l) =>
          l.proficiency
            ? `${l.language} (${l.proficiency.charAt(0).toUpperCase()}${l.proficiency.slice(1)})`
            : l.language,
        )
        .join("  •  ");
      if (languageLine) {
        sectionsChildren.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: languageLine,
                size: 20,
                color: darkHex,
              }),
            ],
          }),
        );
      }
    }

    // Awards
    if (cvData.awards.length > 0) {
      sectionsChildren.push(createSectionHeading("Awards & Honors"));
      for (const award of cvData.awards) {
        const meta = [award.issuer, award.date].filter(Boolean).join("  |  ");
        sectionsChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: award.description ? 20 : 50 },
            children: [
              new TextRun({
                text: award.title,
                bold: true,
                size: 20,
                color: darkHex,
              }),
              ...(meta
                ? [
                    new TextRun({
                      text: `  —  ${meta}`,
                      size: 20,
                      color: mutedHex,
                    }),
                  ]
                : []),
            ],
          }),
        );
        if (award.description?.trim()) {
          sectionsChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              indent: { left: 360 },
              children: [
                new TextRun({
                  text: award.description.trim(),
                  size: 19,
                  color: mutedHex,
                }),
              ],
            }),
          );
        }
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: sectionsChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    triggerDownload(
      blob,
      `${sanitizeFileName(cvData.personalInfo.fullName)}_Resume.docx`,
    );
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify({ cvData, settings }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    triggerDownload(
      blob,
      `${sanitizeFileName(cvData.personalInfo.fullName)}_backup.json`,
    );
  };

  const exportTXT = () => {
    let txtContent = `${cvData.personalInfo.fullName}\n`;
    txtContent += `${cvData.personalInfo.title}\n\n`;
    txtContent += `CONTACT\n`;
    txtContent += `Email: ${cvData.personalInfo.email}\n`;
    txtContent += `Phone: ${cvData.personalInfo.phone}\n`;
    txtContent += `Location: ${cvData.personalInfo.location}\n\n`;

    if (cvData.personalInfo.summary) {
      txtContent += `SUMMARY\n${cvData.personalInfo.summary}\n\n`;
    }

    if (cvData.experience.length > 0) {
      txtContent += `EXPERIENCE\n`;
      cvData.experience.forEach((exp) => {
        txtContent += `\n${exp.title} - ${exp.company}\n`;
        txtContent += `${exp.startDate} - ${exp.current ? "Present" : exp.endDate} | ${exp.location}\n`;
        const lines = [...toLines(exp.description), ...toLines(exp.highlights)];
        if (lines.length > 0) {
          txtContent += `${lines.map((l) => `- ${l}`).join("\n")}\n`;
        }
      });
      txtContent += `\n`;
    }

    if (cvData.education.length > 0) {
      txtContent += `EDUCATION\n`;
      cvData.education.forEach((edu) => {
        txtContent += `\n${edu.degree} - ${edu.institution}\n`;
        txtContent += `${edu.startDate} - ${edu.endDate}\n`;
        if (edu.gpa) txtContent += `GPA: ${edu.gpa}\n`;
      });
      txtContent += `\n`;
    }

    if (cvData.skills.length > 0) {
      txtContent += `SKILLS\n`;
      cvData.skills.forEach((skill) => {
        txtContent += `${skill.category}: ${skill.items.join(", ")}\n`;
      });
    }

    const blob = new Blob([txtContent], { type: "text/plain" });
    triggerDownload(
      blob,
      `${sanitizeFileName(cvData.personalInfo.fullName)}_Resume.txt`,
    );
  };

  const exportLinkedIn = async () => {
    let linkedInText = `${cvData.personalInfo.title}\n\n`;
    linkedInText += `ABOUT\n${cvData.personalInfo.summary}\n\n`;

    if (cvData.experience.length > 0) {
      linkedInText += `EXPERIENCE\n\n`;
      cvData.experience.forEach((exp) => {
        linkedInText += `${exp.title}\n`;
        linkedInText += `${exp.company} · ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`;
        linkedInText += `${exp.location}\n\n`;
        const lines = [...toLines(exp.description), ...toLines(exp.highlights)];
        if (lines.length > 0) {
          linkedInText += `${lines.map((l) => `• ${l}`).join("\n")}\n\n`;
        }
      });
    }

    await navigator.clipboard.writeText(linkedInText);
  };

  const handleEmailExport = async () => {
    const subject = `Resume - ${cvData.personalInfo.fullName || "Candidate"}`;
    const body = `Hi,\n\nPlease find attached my resume.\n\nBest regards,\n${cvData.personalInfo.fullName || ""}`;

    try {
      await exportPDF();
    } catch {
      toast.error("Failed to generate PDF for email");
      return;
    }

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    toast.info(
      "Email client opened. Please attach the downloaded PDF manually.",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Your Resume</DialogTitle>
          <DialogDescription>
            Choose a format and template for your resume export
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) =>
                setSelectedFormat(value as ExportFormat)
              }
            >
              <div className="grid gap-3">
                {exportFormats.map((format) => (
                  <Card
                    key={format.id}
                    className={`p-4 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-ring/60 ${
                      selectedFormat === format.id
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <div className="flex items-start gap-4">
                      <RadioGroupItem
                        value={format.id}
                        id={format.id}
                        className="mt-1"
                      />
                      <format.icon className="h-6 w-6 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label
                            htmlFor={format.id}
                            className="font-semibold cursor-pointer"
                          >
                            {format.name}
                          </Label>
                          {format.recommended && (
                            <Badge variant="default" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {format.size}
                        </p>
                      </div>
                      {selectedFormat === format.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <RadioGroup
              value={selectedTemplate}
              onValueChange={(value) =>
                setSelectedTemplate(value as "modern" | "classic" | "minimal")
              }
            >
              <div className="grid gap-3 md:grid-cols-2">
                {(["modern", "classic", "minimal"] as const).map((template) => (
                  <Card
                    key={template}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedTemplate === template
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={template} id={template} />
                      <Label
                        htmlFor={template}
                        className="font-medium cursor-pointer capitalize"
                      >
                        {template}
                      </Label>
                    </div>
                    <div className="mt-3 h-32 bg-muted rounded border flex items-center justify-center text-muted-foreground text-xs">
                      Template Preview
                    </div>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleEmailExport}
            disabled={isExporting}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Resume
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
