"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";

const stages = [
  { id: "applied", name: "Applied", count: 45, candidates: [{ name: "John Doe", position: "Developer" }] },
  { id: "screening", name: "Phone Screen", count: 23, candidates: [{ name: "Jane Smith", position: "Designer" }] },
  { id: "technical", name: "Technical", count: 15, candidates: [{name: "Bob Wilson", position: "Engineer" }] },
  { id: "final", name: "Final Round", count: 8, candidates: [{ name: "Alice Brown", position: "Manager" }] },
  { id: "offer", name: "Offer", count: 3, candidates: [{ name: "Charlie Davis", position: "Lead" }] },
];

function CandidateCard({ candidate }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: candidate.name });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white p-3 rounded border mb-2 cursor-move hover:shadow">
      <p className="font-medium text-sm">{candidate.name}</p>
      <p className="text-xs text-muted-foreground">{candidate.position}</p>
    </div>
  );
}

export default function TalentPipelinePage() {
  const [pipelineStages, setPipelineStages] = useState(stages);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Talent Pipeline</h1>
        <p className="text-muted-foreground mt-1">Track candidates through your hiring process</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active Candidates", value: "94" },
          { label: "Avg. Time to Hire", value: "18 days" },
          { label: "Offer Acceptance", value: "92%" },
          { label: "Pipeline Health", value: "Excellent" },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage, idx) => (
              <motion.div key={stage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{stage.name}</h3>
                  <Badge variant="secondary">{stage.count}</Badge>
                </div>
                <div className="space-y-2">
                  {stage.candidates.map((candidate, cidx) => (
                    <Card key={cidx} className="p-3">
                      <div className="font-medium text-sm">{candidate.name}</div>
                      <div className="text-xs text-muted-foreground">{candidate.position}</div>
                    </Card>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full text-xs">View all</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
