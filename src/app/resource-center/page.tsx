"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, FileText, Folder, Download } from "lucide-react";

export default function ResourceCenterPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Center</h1>
          <p className="text-muted-foreground mt-1">Document library and file management</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Files", value: "234", icon: FileText },
          { label: "Folders", value: "12", icon: Folder },
          { label: "Storage Used", value: "2.4 GB", icon: FileText },
          { label: "Downloads", value: "1.2k", icon: Download },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search files and folders..." className="pl-10" />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {[
              { name: "Interview Guidelines.pdf", size: "2.4 MB", modified: "2h ago", type: "PDF" },
              { name: "Question Bank.docx", size: "1.1 MB", modified: "5h ago", type: "DOCX" },
              { name: "Evaluation Templates", size: "8 items", modified: "1d ago", type: "Folder" },
              { name: "Onboarding Checklist.xlsx", size: "524 KB", modified: "2d ago", type: "XLSX" },
            ].map((file) => (
              <Card key={file.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {file.type === "Folder" ? (
                        <Folder className="h-8 w-8 text-blue-500" />
                      ) : (
                        <FileText className="h-8 w-8 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.size} • {file.modified}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{file.type}</Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {["documents", "templates", "recent"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {tab.charAt(0).toUpperCase() + tab.slice(1)} will appear here
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
