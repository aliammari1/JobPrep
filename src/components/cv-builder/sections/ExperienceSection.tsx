"use client";

import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface SortableExperienceItemProps {
  exp: any;
  updateExperience: (id: string, data: any) => void;
  removeExperience: (id: string) => void;
  newBulletInputs: Record<string, string>;
  setNewBulletInputs: (inputs: Record<string, string>) => void;
}

function SortableExperienceItem({
  exp,
  updateExperience,
  removeExperience,
  newBulletInputs,
  setNewBulletInputs,
}: SortableExperienceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddBullet = (expId: string) => {
    const newBullet = newBulletInputs[expId]?.trim();
    if (newBullet) {
      updateExperience(expId, {
        description: [...(exp.description || []), newBullet],
      });
      setNewBulletInputs({ ...newBulletInputs, [expId]: "" });
    }
  };

  const handleRemoveBullet = (bulletIndex: number) => {
    const newBullets = (exp.description || []).filter(
      (_: string, idx: number) => idx !== bulletIndex,
    );
    updateExperience(exp.id, { description: newBullets });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? "shadow-2xl ring-2 ring-primary" : ""}`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <h4 className="font-semibold flex-1">Experience Entry</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeExperience(exp.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Job Title *</Label>
            <Input
              value={exp.title}
              onChange={(e) =>
                updateExperience(exp.id, { title: e.target.value })
              }
              placeholder="Senior Software Engineer"
            />
          </div>

          <div>
            <Label>Company *</Label>
            <Input
              value={exp.company}
              onChange={(e) =>
                updateExperience(exp.id, { company: e.target.value })
              }
              placeholder="Tech Corp"
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={exp.location}
              onChange={(e) =>
                updateExperience(exp.id, { location: e.target.value })
              }
              placeholder="San Francisco, CA"
            />
          </div>

          <div>
            <Label>Start Date</Label>
            <Input
              type="month"
              value={exp.startDate}
              onChange={(e) =>
                updateExperience(exp.id, { startDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label>End Date</Label>
            <Input
              type="month"
              value={exp.endDate}
              onChange={(e) =>
                updateExperience(exp.id, { endDate: e.target.value })
              }
              disabled={exp.current}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`current-${exp.id}`}
              checked={exp.current}
              onCheckedChange={(checked) =>
                updateExperience(exp.id, { current: !!checked })
              }
            />
            <Label htmlFor={`current-${exp.id}`} className="cursor-pointer">
              Currently working here
            </Label>
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <div className="mt-2 space-y-2">
            {(exp.description || []).map((bullet: string, idx: number) => (
              <div
                key={`bullet-${idx}`}
                className="flex items-center gap-2 p-2 bg-muted rounded"
              >
                <span className="text-muted-foreground">•</span>
                <span className="flex-1">{bullet}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBullet(idx)}
                  className="hover:text-destructive p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              value={newBulletInputs[exp.id] || ""}
              onChange={(e) =>
                setNewBulletInputs({
                  ...newBulletInputs,
                  [exp.id]: e.target.value,
                })
              }
              placeholder="Add description bullet point"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddBullet(exp.id);
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleAddBullet(exp.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ExperienceSection() {
  const {
    cvData,
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
  } = useCVStore();
  const { experience } = cvData;
  const [newBulletInputs, setNewBulletInputs] = useState<
    Record<string, string>
  >({});
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAdd = () => {
    addExperience({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [],
      highlights: [],
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experience.findIndex((exp) => exp.id === active.id);
      const newIndex = experience.findIndex((exp) => exp.id === over.id);

      const newExperience = arrayMove(experience, oldIndex, newIndex);
      reorderExperience(newExperience);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {experience.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No experience added yet. Click "Add Experience" to start.
          </p>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experience.map((exp) => exp.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {experience.map((exp) => (
                <SortableExperienceItem
                  key={exp.id}
                  exp={exp}
                  updateExperience={updateExperience}
                  removeExperience={removeExperience}
                  newBulletInputs={newBulletInputs}
                  setNewBulletInputs={setNewBulletInputs}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
