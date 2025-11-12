"use client";

import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function ProjectsSection() {
    const { cvData, addProject, updateProject, removeProject } = useCVStore();
    const { projects } = cvData;
    const [newTechInputs, setNewTechInputs] = useState<Record<string, string>>({});
    const [newBulletInputs, setNewBulletInputs] = useState<Record<string, string>>({});

    const handleAdd = () => {
        addProject({
            name: "",
            description: [],
            technologies: [],
            url: "",
            github: "",
        });
    };

    const handleAddBullet = (projectId: string) => {
        const project = projects.find((p) => p.id === projectId);
        const newBullet = newBulletInputs[projectId]?.trim();
        if (project && newBullet) {
            updateProject(projectId, { description: [...(project.description || []), newBullet] });
            setNewBulletInputs({ ...newBulletInputs, [projectId]: "" });
        }
    };

    const handleRemoveBullet = (projectId: string, bulletIndex: number) => {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            const newBullets = (project.description || []).filter((_, idx) => idx !== bulletIndex);
            updateProject(projectId, { description: newBullets });
        }
    };

    const handleAddTech = (projectId: string) => {
        const project = projects.find((p) => p.id === projectId);
        const newTech = newTechInputs[projectId]?.trim();
        if (project && newTech) {
            updateProject(projectId, { technologies: [...project.technologies, newTech] });
            setNewTechInputs({ ...newTechInputs, [projectId]: "" });
        }
    };

    const handleRemoveTech = (projectId: string, techIndex: number) => {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            const newTechs = project.technologies.filter((_, idx) => idx !== techIndex);
            updateProject(projectId, { technologies: newTechs });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Projects</h3>
                <Button onClick={handleAdd} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                </Button>
            </div>

            {projects.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No projects added yet. Click "Add Project" to start.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <Card key={project.id} className="p-4">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-semibold">Project Entry</h4>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeProject(project.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>

                                <div>
                                    <Label>Project Name *</Label>
                                    <Input
                                        value={project.name}
                                        onChange={(e) => updateProject(project.id, { name: e.target.value })}
                                        placeholder="Awesome Project"
                                    />
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <div className="mt-2 space-y-2">
                                        {(project.description || []).map((bullet, idx) => (
                                            <div key={`bullet-${idx}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="flex-1">{bullet}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBullet(project.id, idx)}
                                                    className="hover:text-destructive p-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <Input
                                            value={newBulletInputs[project.id] || ""}
                                            onChange={(e) =>
                                                setNewBulletInputs({ ...newBulletInputs, [project.id]: e.target.value })
                                            }
                                            placeholder="Add description bullet point"
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddBullet(project.id);
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleAddBullet(project.id)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Technologies</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {project.technologies.map((tech, idx) => (
                                            <Badge key={`tech-${idx}`} variant="secondary">
                                                {tech}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTech(project.id, idx)}
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <Input
                                            value={newTechInputs[project.id] || ""}
                                            onChange={(e) =>
                                                setNewTechInputs({ ...newTechInputs, [project.id]: e.target.value })
                                            }
                                            placeholder="Add technology"
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddTech(project.id);
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleAddTech(project.id)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Live URL</Label>
                                        <Input
                                            value={project.url}
                                            onChange={(e) => updateProject(project.id, { url: e.target.value })}
                                            placeholder="https://project.com"
                                        />
                                    </div>

                                    <div>
                                        <Label>GitHub URL</Label>
                                        <Input
                                            value={project.github}
                                            onChange={(e) => updateProject(project.id, { github: e.target.value })}
                                            placeholder="https://github.com/user/repo"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}