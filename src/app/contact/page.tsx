"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useEmail } from "@/hooks/use-email";

const contactMethods = [
  {
    title: "Email Us",
    description: "Get a response within 24 hours",
    value: "support@jobprep.ai",
    icon: Mail,
    href: "mailto:support@jobprep.ai",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Call Us",
    description: "Mon-Fri, 9am to 6pm PST",
    value: "+1 (555) 123-4567",
    icon: Phone,
    href: "tel:+15551234567",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Visit Us",
    description: "Come say hello in person",
    value: "San Francisco, CA",
    icon: MapPin,
    href: "#",
    color: "from-purple-500 to-pink-500",
  },
];

const inquiryTypes = [
  "General Inquiry",
  "Sales & Pricing",
  "Technical Support",
  "Feature Request",
  "Partnership",
  "Press & Media",
  "Other",
];

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
    setIsSubmitting(true);

    try {
      // Create email HTML template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Contact Form Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Form Submission</h1>
              
              <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                ${formData.company ? `<p><strong>Company:</strong> ${formData.company}</p>` : ""}
                <p><strong>Inquiry Type:</strong> ${formData.inquiryType}</p>
              </div>

              <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="color: #1f2937; margin-top: 0;">Subject</h2>
                <p>${formData.subject}</p>
              </div>

              <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h2 style="color: #1f2937; margin-top: 0;">Message</h2>
                <p style="white-space: pre-wrap;">${formData.message}</p>
              </div>

              <div style="margin-top: 30px; padding: 15px; background-color: #e0f2fe; border-radius: 6px; border-left: 4px solid #2563eb;">
                <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
                  <strong>Reply to:</strong> <a href="mailto:${formData.email}" style="color: #2563eb;">${formData.email}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Send email using the email service
      const result = await sendEmail({
        to: "ammari.ali.0001@gmail.com",
        subject: `Contact Form: ${formData.subject}`,
        html: emailHtml,
        text: `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
${formData.company ? `Company: ${formData.company}\n` : ""}Inquiry Type: ${formData.inquiryType}
Subject: ${formData.subject}

Message:
${formData.message}

Reply to: ${formData.email}
        `,
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
        toast.success("Message sent successfully! We'll get back to you soon.");

        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: "",
            email: "",
            company: "",
            inquiryType: "",
            subject: "",
            message: "",
          });
        }, 3000);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-primary/5 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto text-center"
        >
          <Badge
            variant="outline"
            className="mb-6 backdrop-blur-sm border-primary/20"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Get in Touch
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-linear-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Let's Start a Conversation
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="px-4 sm:px-8 md:px-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method, idx) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group">
                  <CardHeader className="text-center">
                    <div
                      className={`mx-auto p-4 rounded-xl bg-linear-to-br ${method.color} w-fit mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <a
                      href={method.href}
                      className="text-primary hover:underline font-medium text-lg block group-hover:text-primary/80 transition-colors"
                    >
                      {method.value}
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="px-4 sm:px-8 md:px-12 pb-20 bg-muted/50">
        <div className="max-w-6xl mx-auto py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription className="text-base">
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="mx-auto p-4 rounded-full bg-green-100 dark:bg-green-900/20 w-fit mb-4">
                        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground text-lg">
                        We've received your message and will respond shortly.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
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
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            name="company"
                            placeholder="Acme Inc."
                            value={formData.company}
                            onChange={handleChange}
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="inquiryType">
                            Inquiry Type{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.inquiryType}
                            onValueChange={(value) =>
                              setFormData({ ...formData, inquiryType: value })
                            }
                            required
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {inquiryTypes.map((type) => (
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
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-base"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Response Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">General Inquiries</p>
                    <p className="text-sm text-muted-foreground">
                      Within 24 hours
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Sales & Enterprise</p>
                    <p className="text-sm text-muted-foreground">
                      Within 4 hours
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Technical Support</p>
                    <p className="text-sm text-muted-foreground">
                      Within 12 hours
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <Sparkles className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Need Immediate Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Check out our comprehensive documentation and FAQ section
                    for instant answers.
                  </p>
                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Link href="/features">
                        View Features
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Link href="/pricing">
                        View Pricing
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
