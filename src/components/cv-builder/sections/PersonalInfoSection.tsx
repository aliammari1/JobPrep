"use client";

import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import Image from "next/image";

export function PersonalInfoSection() {
  const { cvData, updatePersonalInfo } = useCVStore();
  const { personalInfo } = cvData;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          updatePersonalInfo({ photo: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    },
    [updatePersonalInfo],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Personal Information</h2>
        <p className="text-sm text-muted-foreground">
          Start by adding your basic contact details
        </p>
      </div>

      <div className="space-y-6">
        {/* Photo Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Profile Photo</Label>
          <div
            {...getRootProps()}
            className={`flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input {...getInputProps()} />
            {personalInfo.photo ? (
              <div className="relative h-full w-40">
                <Image
                  src={personalInfo.photo}
                  alt="Profile"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            ) : (
              <div className="text-center px-4">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  Drop photo here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={personalInfo.fullName}
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              placeholder="John Doe"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Professional Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={personalInfo.title}
              onChange={(e) => updatePersonalInfo({ title: e.target.value })}
              placeholder="Senior Software Engineer"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => updatePersonalInfo({ email: e.target.value })}
              placeholder="john@example.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="location"
              value={personalInfo.location}
              onChange={(e) => updatePersonalInfo({ location: e.target.value })}
              placeholder="San Francisco, CA"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium">
              Website
            </Label>
            <Input
              id="website"
              value={personalInfo.website}
              onChange={(e) => updatePersonalInfo({ website: e.target.value })}
              placeholder="https://johndoe.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-sm font-medium">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/johndoe"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github" className="text-sm font-medium">
              GitHub
            </Label>
            <Input
              id="github"
              value={personalInfo.github}
              onChange={(e) => updatePersonalInfo({ github: e.target.value })}
              placeholder="github.com/johndoe"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary" className="text-sm font-medium">
            Professional Summary <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="summary"
            value={personalInfo.summary}
            onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
            placeholder="Write a compelling summary of your professional background..."
            rows={6}
            className="resize-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {personalInfo.summary.length} / 500 characters
          </p>
        </div>
      </div>
    </div>
  );
}
