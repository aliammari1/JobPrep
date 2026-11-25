"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmail } from "@/hooks/use-email";

const INQUIRY_TYPES = [
  "General Inquiry",
  "Technical Support",
  "Self-Hosting & BYOK",
  "Plans & Billing",
  "Feature Request",
  "Team & Partnerships",
];

const RESPONSE_CHANNELS = [
  {
    label: "General & Billing",
    window: "Within 1 business day",
  },
  {
    label: "Technical Support",
    window: "Within 12 hours",
  },
  {
    label: "Self-Hosting & Teams",
    window: "Within 1 business day",
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { sendEmail } = useEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.inquiryType) {
      toast.error("Please select an inquiry type.");
      return;
    }

    setIsSubmitting(true);

    try {
      const safeName = escapeHtml(formData.name.trim());
      const safeEmail = escapeHtml(formData.email.trim());
      const safeCompany = escapeHtml(formData.company.trim());
      const safeType = escapeHtml(formData.inquiryType);
      const safeSubject = escapeHtml(formData.subject.trim());
      const safeMessage = escapeHtml(formData.message.trim());

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Contact Form Submission</title>
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #090b10;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Form Submission</h1>

              <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="color: #090b10; margin-top: 0;">Contact Details</h2>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                ${safeCompany ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ""}
                <p><strong>Inquiry Type:</strong> ${safeType}</p>
              </div>

              <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="color: #090b10; margin-top: 0;">Subject</h2>
                <p>${safeSubject}</p>
              </div>

              <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="color: #090b10; margin-top: 0;">Message</h2>
                <p style="white-space: pre-wrap;">${safeMessage}</p>
              </div>

              <div style="margin-top: 24px; padding: 14px; background-color: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
                <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
                  <strong>Reply to:</strong> <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = await sendEmail({
        to: "ammari.ali.0001@gmail.com",
        subject: `Contact Form: ${formData.subject.trim()}`,
        html: emailHtml,
        text: [
          "New Contact Form Submission",
          "",
          `Name: ${formData.name.trim()}`,
          `Email: ${formData.email.trim()}`,
          formData.company.trim()
            ? `Company: ${formData.company.trim()}`
            : null,
          `Inquiry Type: ${formData.inquiryType}`,
          `Subject: ${formData.subject.trim()}`,
          "",
          "Message:",
          formData.message.trim(),
          "",
          `Reply to: ${formData.email.trim()}`,
        ]
          .filter((line) => line !== null)
          .join("\n"),
        tags: [
          { name: "category", value: "contact_form" },
          {
            name: "inquiry_type",
            value: formData.inquiryType.toLowerCase().replace(/\s+/g, "_"),
          },
        ],
      });

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Message sent. We'll respond shortly.");
      } else {
        toast.error(
          result.error || "Failed to send message. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      email: "",
      company: "",
      inquiryType: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="border-b border-border/80 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.025em] text-foreground sm:text-5xl">
              Get in touch with JobPrep
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Questions about mock interviews, BYOK provider setup, billing, or
              self-hosting for your team? Send a note below and we will reply
              directly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form + Channels Split */}
      <section className="bg-muted/35 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="border-b border-border pb-5">
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                    Send a message
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Include relevant details so we can give you a concrete
                    answer on the first reply.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-primary">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      Message received
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                      Thanks for reaching out. We have received your message and
                      will reply to{" "}
                      <span className="font-medium text-foreground">
                        {formData.email}
                      </span>{" "}
                      shortly.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-6"
                      onClick={handleReset}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Alex Rivera"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="alex@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company or School</Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Optional"
                          value={formData.company}
                          onChange={handleChange}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiryType">
                          Topic <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              inquiryType: value,
                            }))
                          }
                        >
                          <SelectTrigger id="inquiryType" className="h-11">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {INQUIRY_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Subject <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Share context, error details, or what you're looking to set up..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="h-11 w-full font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending message..."
                      ) : (
                        <>
                          <Send className="size-4" />
                          Send message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Direct Channels & Expectations */}
            <div className="space-y-5 lg:col-span-5">
              {/* Direct Email Card */}
              <div className="rounded-2xl border border-black/15 bg-[#090b10] p-6 text-white dark:border-white/15">
                <div className="grid size-9 place-items-center rounded-lg bg-[#2563eb]/20 text-[#60a5fa]">
                  <Mail className="size-4" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-white">
                  Direct email
                </h2>
                <p className="mt-1 text-sm text-white/65">
                  Prefer your own email client? Write directly to our support
                  inbox.
                </p>
                <a
                  href="mailto:support@jobprep.ai"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#60a5fa] underline-offset-4 hover:underline"
                >
                  support@jobprep.ai
                  <ArrowRight className="size-3.5" />
                </a>
              </div>

              {/* Response Windows */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2.5">
                  <Clock className="size-4 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Response times
                  </h2>
                </div>
                <dl className="mt-4 divide-y divide-border text-sm">
                  {RESPONSE_CHANNELS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <dt className="font-medium text-foreground">
                        {item.label}
                      </dt>
                      <dd className="text-xs font-medium text-muted-foreground">
                        {item.window}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Helpful Links */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Quick references
                  </h2>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Looking for platform capabilities, plan limits, or how BYOK
                  and offline models work?
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild variant="outline" className="justify-between">
                    <Link href="/features">
                      <span>Explore features</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-between">
                    <Link href="/pricing">
                      <span>View pricing &amp; FAQ</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-between">
                    <Link href="/about">
                      <span>About JobPrep</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
