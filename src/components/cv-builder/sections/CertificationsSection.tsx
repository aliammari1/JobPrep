"use client";

import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function CertificationsSection() {
  const { cvData, addCertification, updateCertification, removeCertification } =
    useCVStore();
  const { certifications } = cvData;

  const handleAdd = () => {
    addCertification({
      name: "",
      issuer: "",
      date: "",
      url: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Certifications</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No certifications added yet. Click "Add Certification" to start.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card key={cert.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold">Certification Entry</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCertification(cert.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Certification Name *</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(cert.id, { name: e.target.value })
                      }
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </div>

                  <div>
                    <Label>Issuing Organization *</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(cert.id, { issuer: e.target.value })
                      }
                      placeholder="Amazon Web Services"
                    />
                  </div>

                  <div>
                    <Label>Date Obtained</Label>
                    <Input
                      type="month"
                      value={cert.date}
                      onChange={(e) =>
                        updateCertification(cert.id, { date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Credential URL</Label>
                    <Input
                      value={cert.url}
                      onChange={(e) =>
                        updateCertification(cert.id, { url: e.target.value })
                      }
                      placeholder="https://credentials.com/cert/123"
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
