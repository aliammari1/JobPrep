"use client";

import { Upload } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCVStore } from "@/store/cv-store";

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

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { "image/*": [".png", ".jpg", ".jpeg"] },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024,
    });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display mb-1 text-2xl font-semibold tracking-tight">
          Personal information
        </h2>
        <p className="text-sm text-muted-foreground">
          Contact details shown on your CV.
        </p>
      </div>

      <div className="space-y-6">
        {/* Form Fields */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              autoComplete="name"
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
              autoComplete="organization-title"
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
              autoComplete="email"
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
              type="tel"
              autoComplete="tel"
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
        <div className="space-y-2">
          <div
            {...getRootProps({
              role: "button",
              "aria-label": personalInfo.photo
                ? "Change profile photo"
                : "Add profile photo",
            })}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:bg-muted/60"}`}
          >
            <input {...getInputProps()} />
            {personalInfo.photo ? (
              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={personalInfo.photo}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <Upload
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <div className="min-w-0">
              <p className="font-medium">
                {personalInfo.photo
                  ? "Change profile photo"
                  : "Add a profile photo"}
              </p>
              <p className="text-xs text-muted-foreground">
                Optional · PNG or JPG up to 5 MB
              </p>
            </div>
          </div>
          {fileRejections[0] && (
            <p role="alert" className="text-sm text-destructive">
              {fileRejections[0].errors[0]?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
