import { ComprehensiveAIAssistant } from "@/components/ai/ComprehensiveAIAssistant";
import { useProjects } from "@/hooks/useProjects";
import { Brain } from "lucide-react";

export default function AIAssistant() {
  const { projects } = useProjects();
  const currentProjectId = projects[0]?.id;

  if (!currentProjectId) {
    return (
      <div className="flex flex-col min-h-screen glass-morphism-bg">
        <div className="flex-1 p-6 space-y-6">
          <div className="glass-morphism-card p-12 rounded-2xl border-0 text-center max-w-2xl mx-auto">
            <Brain className="w-16 h-16 text-primary mx-auto mb-4 ai-pulse" />
                        <h1 className="text-2xl font-bold text-primary-readable mb-2">
              AI Assistant
            </h1>
            <p className="text-muted-foreground">
              Create a project first to start using the AI assistant features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="glass-morphism-card p-8 rounded-2xl border-0 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-primary ai-pulse" />
          </div>
                    <h1 className="text-4xl font-bold text-primary-readable mb-2">
            AI Assistant
          </h1>
          <p className="text-muted-foreground text-lg">
            Powerful AI-driven insights, reports, and automation for your project
          </p>
        </div>

        {/* AI Assistant */}
        <ComprehensiveAIAssistant projectId={currentProjectId} />
      </div>
    </div>
  );
}