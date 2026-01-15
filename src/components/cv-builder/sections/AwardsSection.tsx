"use client";

import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function AwardsSection() {
  const { cvData, addAward, updateAward, removeAward } = useCVStore();
  const { awards } = cvData;

  const handleAdd = () => {
    addAward({
      title: "",
      issuer: "",
      date: "",
      description: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Awards & Honors</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No awards added yet. Click "Add Award" to start.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {awards.map((award) => (
            <Card key={award.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">Award Entry</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAward(award.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Award Title *</Label>
                    <Input
                      value={award.title}
                      onChange={(e) =>
                        updateAward(award.id, { title: e.target.value })
                      }
                      placeholder="Employee of the Year"
                    />
                  </div>

                  <div>
                    <Label>Issuer *</Label>
                    <Input
                      value={award.issuer}
                      onChange={(e) =>
                        updateAward(award.id, { issuer: e.target.value })
                      }
                      placeholder="Company Name"
                    />
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Input
                      type="month"
                      value={award.date}
                      onChange={(e) =>
                        updateAward(award.id, { date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={award.description}
                    onChange={(e) =>
                      updateAward(award.id, { description: e.target.value })
                    }
                    placeholder="Brief description of the award..."
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
