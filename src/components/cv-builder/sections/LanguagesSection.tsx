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
import { Plus, Trash2 } from "lucide-react";

export function LanguagesSection() {
  const { cvData, addLanguage, updateLanguage, removeLanguage } = useCVStore();
  const { languages } = cvData;

  const handleAdd = () => {
    addLanguage({
      language: "",
      proficiency: "conversational",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Languages</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No languages added yet. Click "Add Language" to start.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {languages.map((lang) => (
            <Card key={lang.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">Language Entry</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLanguage(lang.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Language *</Label>
                    <Input
                      value={lang.language}
                      onChange={(e) =>
                        updateLanguage(lang.id, { language: e.target.value })
                      }
                      placeholder="English"
                    />
                  </div>

                  <div>
                    <Label>Proficiency Level *</Label>
                    <Select
                      value={lang.proficiency}
                      onValueChange={(
                        value:
                          | "basic"
                          | "conversational"
                          | "professional"
                          | "native",
                      ) => updateLanguage(lang.id, { proficiency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="conversational">
                          Conversational
                        </SelectItem>
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                      </SelectContent>
                    </Select>
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
