import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIAssistant, ChatMessage } from "@/hooks/useAIAssistant";
import { useProjects } from "@/hooks/useProjects";
import { Bot, Send, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EnhancedAiAssistant() {
  const { messages, sendMessage, clearMessages, loading, error } = useAIAssistant();
  const { projects } = useProjects();
  const [input, setInput] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Set first project as default
  useEffect(() => {
    if (projects.length > 0 && !currentProjectId) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    setInput("");
    
    try {
      await sendMessage(
        messageText, 
        currentProjectId,
        `Project management assistance for: ${projects.find(p => p.id === currentProjectId)?.name || 'current project'}`
      );
    } catch (err) {
      toast.error("Failed to send message");
    }
    
    // Focus back to input
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-soft transition-smooth">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              TaskFlow AI
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-normal">
              Your intelligent project assistant
            </p>
          </div>
        </CardTitle>
        
        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="mt-2">
            <select 
              className="text-xs bg-card border border-border rounded px-2 py-1 w-full"
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
            >
              <option value="">General assistance</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-64 w-full rounded-md border border-border/50 p-3"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about your projects, tasks, or team management!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.content || (loading && message.role === 'assistant' ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </div>
                    ) : '')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask me anything about your project..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1 text-sm"
          />
          <Button 
            size="sm" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-primary"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1">
          {[
            "How's my project doing?",
            "Suggest tasks for today",
            "Show me overdue tasks",
            "Project timeline help"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput(suggestion);
                inputRef.current?.focus();
              }}
              disabled={loading}
              className="text-xs h-6 px-2"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearMessages}
            className="w-full text-xs"
          >
            Clear Conversation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}