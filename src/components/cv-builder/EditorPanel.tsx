"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { AwardsSection } from "./sections/AwardsSection";
import { TemplateSelector } from "./TemplateSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Folder,
  Award,
  Languages as LangIcon,
  Trophy,
} from "lucide-react";

export function EditorPanel() {
  return (
    <div className="flex h-full flex-col bg-muted/20">
      {/* Template Selector - Fixed Header */}
      <div className="border-b bg-background/95 backdrop-blur px-6 py-4">
        <TemplateSelector />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            {/* Improved Tab Navigation with Icons */}
            <div className="space-y-3 mb-6">
              <TabsList className="w-full justify-start h-auto p-1 bg-background border gap-1 flex-wrap">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Code className="h-4 w-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Folder className="h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="certs"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Award className="h-4 w-4" />
                  Certifications
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <LangIcon className="h-4 w-4" />
                  Languages
                </TabsTrigger>
                <TabsTrigger
                  value="awards"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Awards
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content with Card Wrapper */}
            <div className="space-y-6">
              <TabsContent value="personal" className="m-0">
                <Card className="p-6">
                  <PersonalInfoSection />
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="m-0">
                <Card className="p-6">
                  <ExperienceSection />
                </Card>
              </TabsContent>

              <TabsContent value="education" className="m-0">
                <Card className="p-6">
                  <EducationSection />
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="m-0">
                <Card className="p-6">
                  <SkillsSection />
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="m-0">
                <Card className="p-6">
                  <ProjectsSection />
                </Card>
              </TabsContent>

              <TabsContent value="certs" className="m-0">
                <Card className="p-6">
                  <CertificationsSection />
                </Card>
              </TabsContent>

              <TabsContent value="languages" className="m-0">
                <Card className="p-6">
                  <LanguagesSection />
                </Card>
              </TabsContent>

              <TabsContent value="awards" className="m-0">
                <Card className="p-6">
                  <AwardsSection />
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
