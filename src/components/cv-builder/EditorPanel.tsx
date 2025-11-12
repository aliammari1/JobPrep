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
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            {/* Improved Tab Navigation with Icons */}
            <div className="space-y-3 mb-6">
              <TabsList className="grid grid-cols-4 w-full h-auto p-1 bg-background border gap-1">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <User className="h-4 w-4" />
                  <span className="text-xs">Personal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Experience</span>
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-xs">Education</span>
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <Code className="h-4 w-4" />
                  <span className="text-xs">Skills</span>
                </TabsTrigger>

                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <Folder className="h-4 w-4" />
                  <span className="text-xs">Projects</span>
                </TabsTrigger>
                <TabsTrigger
                  value="certs"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <Award className="h-4 w-4" />
                  <span className="text-xs">Certifications</span>
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <LangIcon className="h-4 w-4" />
                  <span className="text-xs">Languages</span>
                </TabsTrigger>
                <TabsTrigger
                  value="awards"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 flex flex-col"
                >
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs">Awards</span>
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
