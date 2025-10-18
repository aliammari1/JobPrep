"use client";

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
import { motion } from "framer-motion";
import {
  Target,
  Users,
  Zap,
  Heart,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Rocket,
  Globe,
  Shield,
} from "lucide-react";

const values = [
  {
    title: "Innovation First",
    description:
      "We constantly push the boundaries of AI technology to create better interview preparation tools that evolve with industry needs.",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Empower Everyone",
    description:
      "We believe everyone deserves the opportunity to showcase their best self in interviews, regardless of background or experience.",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Quality Obsessed",
    description:
      "We're committed to delivering the highest quality interview experiences and insights through rigorous testing and refinement.",
    icon: Award,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Community Driven",
    description:
      "We foster a supportive community where users can learn, grow, and succeed together through shared experiences.",
    icon: Users,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Continuous Growth",
    description:
      "We help individuals and teams continuously improve their interviewing skills through data-driven insights and feedback.",
    icon: TrendingUp,
    color: "from-red-500 to-rose-500",
  },
  {
    title: "Passionate Hearts",
    description:
      "We're passionate about making interview preparation accessible, effective, and transformative for everyone we serve.",
    icon: Heart,
    color: "from-pink-500 to-purple-500",
  },
];

const timeline = [
  {
    year: "2023",
    title: "The Beginning",
    description:
      "Founded with a mission to democratize interview preparation through AI",
    achievements: ["Launched MVP", "First 1,000 users", "Seed funding secured"],
  },
  {
    year: "2024",
    title: "Rapid Growth",
    description: "Expanded features and reached global audience",
    achievements: [
      "50K+ active users",
      "15 new features",
      "Series A funding",
      "20+ team members",
    ],
  },
  {
    year: "2025",
    title: "Enterprise Ready",
    description: "Scaled platform for teams and organizations",
    achievements: [
      "100K+ users",
      "Enterprise features",
      "Global expansion",
      "AI Model v3",
    ],
  },
  {
    year: "Future",
    title: "What's Next",
    description: "Building the future of interview preparation",
    achievements: [
      "VR interviews",
      "Real-time translation",
      "Industry partnerships",
      "Mobile app",
    ],
  },
];

const stats = [
  {
    label: "Active Users",
    value: "100K+",
    description: "Professionals preparing for interviews",
  },
  {
    label: "Interviews Conducted",
    value: "500K+",
    description: "Practice sessions completed",
  },
  {
    label: "Success Rate",
    value: "85%",
    description: "Users who landed their dream job",
  },
  { label: "Countries", value: "150+", description: "Global reach and impact" },
  {
    label: "Team Members",
    value: "50+",
    description: "Dedicated professionals",
  },
  {
    label: "AI Accuracy",
    value: "95%",
    description: "Feedback precision rate",
  },
];

const team = [
  {
    name: "Our Mission",
    description:
      "To revolutionize interview preparation by making world-class AI-powered coaching accessible to everyone, helping candidates land their dream jobs and organizations find the perfect talent through data-driven insights and personalized guidance.",
    icon: Target,
  },
  {
    name: "Our Vision",
    description:
      "A world where every interview is an opportunity for growth, where preparation meets confidence, and where the best talent connects with the right opportunities through intelligent technology and human-centered design.",
    icon: Rocket,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

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
            <Sparkles className="h-3 w-3 mr-1" />
            About JobPrep AI
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Transforming Interview Preparation
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to help people ace their interviews and land
            their dream jobs through cutting-edge AI technology and personalized
            coaching.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-8 md:px-12 py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="text-center hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                      {stat.value}
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold text-foreground mt-2">
                      {stat.label}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 sm:px-8 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            {team.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-fit mb-4">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-4">{item.name}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-foreground/90">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 sm:px-8 md:px-12 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">
              From startup to industry leader
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row gap-8 items-center ${
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      idx % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge className="w-fit mb-2" variant="secondary">
                          {item.year}
                        </Badge>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription className="text-base">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {item.achievements.map((achievement) => (
                            <li
                              key={achievement}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Sparkles className="h-4 w-4 text-primary shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0 ring-4 ring-background z-10">
                    {idx + 1}
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 sm:px-8 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {values.map((value, idx) => (
              <motion.div key={value.title} variants={itemVariants}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group">
                  <CardHeader>
                    <div
                      className={`mb-4 p-4 rounded-xl bg-gradient-to-br ${value.color} w-fit`}
                    >
                      <value.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {value.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed mt-2">
                      {value.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 sm:px-8 md:px-12 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Our Story
          </h2>
          <Card>
            <CardContent className="p-8 space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                JobPrep AI was born from a simple observation: interview
                preparation hasn't evolved with technology. While AI has
                transformed countless industries, job seekers were still
                practicing with outdated methods, limited feedback, and no
                personalized guidance.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We set out to change that. By combining cutting-edge AI
                technology with deep insights from interview experts and
                recruiters, we created a platform that provides personalized,
                real-time coaching that adapts to each user's unique needs,
                goals, and learning style.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Today, JobPrep AI helps hundreds of thousands of people around
                the world prepare for interviews with confidence, improve their
                skills systematically, and land their dream jobs. We're just
                getting started, and we're excited to continue innovating and
                growing alongside our amazing community of users.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background flex items-center justify-center text-white font-semibold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold">Join 100,000+ users</p>
                  <p className="text-sm text-muted-foreground">
                    Who trust JobPrep AI
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-8 md:px-12 py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Join Our Mission
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Be part of the community that's transforming how people prepare
              for interviews
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Join 100,000+ professionals • No credit card required
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
