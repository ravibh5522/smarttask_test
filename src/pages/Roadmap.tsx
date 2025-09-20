import { useState } from "react";
import { ProjectRoadmap } from "@/components/roadmap/ProjectRoadmap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";

const Roadmap = () => {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Use first project as default if available
  const currentProject = selectedProject || projects[0]?.id || "";

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="glass-morphism-card p-6 rounded-xl border-0">
            <h1 className="text-3xl font-bold text-primary-readable">Project Roadmap</h1>
            <p className="text-muted-foreground">
              Plan and track your project milestones
            </p>
          </div>
          
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 glass-input border-0 bg-white/5">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent className="glass-morphism-card border-0">
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentProject ? (
          <div className="glass-morphism-card p-6 rounded-xl border-0">
            <ProjectRoadmap projectId={currentProject} />
          </div>
        ) : (
          <div className="glass-morphism-card p-12 rounded-xl border-0 text-center">
            <h3 className="font-medium mb-2">No projects available</h3>
            <p className="text-muted-foreground">
              Create a project first to start planning your roadmap
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmap;