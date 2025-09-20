import React from "react";
import { TaskList } from "@/components/tasks/TaskList";

interface ProjectTasksProps {
  projectId: string;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  return (
    <div className="space-y-6">
      <TaskList projectId={projectId} />
    </div>
  );
}