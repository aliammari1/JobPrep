"use client";

import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function SkillsSection() {
  const { cvData, addSkill, updateSkill, removeSkill } = useCVStore();
  const { skills } = cvData;
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>(
    {},
  );

  const handleAdd = () => {
    addSkill({
      category: "",
      items: [],
    });
  };

  const handleAddSkillItem = (skillId: string) => {
    const skill = skills.find((s) => s.id === skillId);
    const newItem = newSkillInputs[skillId]?.trim();
    if (skill && newItem) {
      updateSkill(skillId, { items: [...skill.items, newItem] });
      setNewSkillInputs({ ...newSkillInputs, [skillId]: "" });
    }
  };

  const handleRemoveSkillItem = (skillId: string, itemIndex: number) => {
    const skill = skills.find((s) => s.id === skillId);
    if (skill) {
      const newItems = skill.items.filter((_, idx) => idx !== itemIndex);
      updateSkill(skillId, { items: newItems });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Skill Category
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No skills added yet. Click "Add Skill Category" to start.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => (
            <Card key={skill.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">Skill Category</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkill(skill.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Category Name *</Label>
                    <Input
                      value={skill.category}
                      onChange={(e) =>
                        updateSkill(skill.id, { category: e.target.value })
                      }
                      placeholder="e.g., Programming Languages"
                    />
                  </div>
                </div>

                <div>
                  <Label>Skills</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skill.items.map((item, idx) => (
                      <Badge key={idx} variant="secondary">
                        {item}
                        <button
                          onClick={() => handleRemoveSkillItem(skill.id, idx)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Input
                      value={newSkillInputs[skill.id] || ""}
                      onChange={(e) =>
                        setNewSkillInputs({
                          ...newSkillInputs,
                          [skill.id]: e.target.value,
                        })
                      }
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkillItem(skill.id);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddSkillItem(skill.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
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
