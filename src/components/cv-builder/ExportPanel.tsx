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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileDown,
  FileText,
  FileJson,
  FileType,
  Linkedin,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function ExportPanel() {
  const { cvData, settings } = useCVStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<
    "pdf" | "docx" | "json" | "txt" | "linkedin"
  >("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState(settings.template);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
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
      name: "Word Document",
      icon: FileType,
      description: "Editable DOCX file for Microsoft Word",
      size: "~150 KB",
      recommended: false,
      comingSoon: true,
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
      size: "N/A",
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
        case "json":
          exportJSON();
          break;
        case "txt":
          exportTXT();
          break;
        case "linkedin":
          exportLinkedIn();
          break;
        case "docx":
          toast.error("DOCX export coming soon!");
          break;
      }
      toast.dismiss(loadingToast);
      toast.success(`${selectedFormat.toUpperCase()} exported successfully!`);
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
      body: JSON.stringify({ cvData, template: selectedTemplate }),
    });

    if (!res.ok) throw new Error("PDF generation failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.personalInfo.fullName || "CV"}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify({ cvData, settings }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.personalInfo.fullName || "CV"}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
        txtContent += `${exp.description}\n`;
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
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.personalInfo.fullName || "CV"}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportLinkedIn = () => {
    let linkedInText = `${cvData.personalInfo.title}\n\n`;
    linkedInText += `ABOUT\n${cvData.personalInfo.summary}\n\n`;

    if (cvData.experience.length > 0) {
      linkedInText += `EXPERIENCE\n\n`;
      cvData.experience.forEach((exp) => {
        linkedInText += `${exp.title}\n`;
        linkedInText += `${exp.company} · ${exp.current ? "Present" : exp.endDate}\n`;
        linkedInText += `${exp.location}\n\n`;
        linkedInText += `${exp.description}\n\n`;
      });
    }

    navigator.clipboard.writeText(linkedInText);
    toast.success("LinkedIn profile text copied to clipboard!");
  };

  const handleEmailExport = async () => {
    const subject = `Resume - ${cvData.personalInfo.fullName}`;
    const body = `Hi,\n\nPlease find attached my resume.\n\nBest regards,\n${cvData.personalInfo.fullName}`;

    // Generate PDF first
    const res = await fetch("/api/cv/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvData, template: selectedTemplate }),
    });

    if (!res.ok) {
      toast.error("Failed to generate PDF for email");
      return;
    }

    const blob = await res.blob();
    const file = new File(
      [blob],
      `${cvData.personalInfo.fullName}_Resume.pdf`,
      { type: "application/pdf" },
    );

    // Open mailto with attachment (note: not all email clients support this)
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    toast.info(
      "Email client opened. Please attach the downloaded PDF manually.",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
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
              onValueChange={(value: any) => setSelectedFormat(value)}
            >
              <div className="grid gap-3">
                {exportFormats.map((format) => (
                  <Card
                    key={format.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedFormat === format.id
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:shadow-sm"
                    } ${format.comingSoon ? "opacity-50" : ""}`}
                    onClick={() =>
                      !format.comingSoon && setSelectedFormat(format.id as any)
                    }
                  >
                    <div className="flex items-start gap-4">
                      <RadioGroupItem
                        value={format.id}
                        id={format.id}
                        disabled={format.comingSoon}
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
                          {format.comingSoon && (
                            <Badge variant="secondary" className="text-xs">
                              Coming Soon
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
              onValueChange={(value: any) => setSelectedTemplate(value)}
            >
              <div className="grid gap-3 grid-cols-2">
                {["modern", "classic", "minimal"].map((template) => (
                  <Card
                    key={template}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedTemplate === template
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedTemplate(template as any)}
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
