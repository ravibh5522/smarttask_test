import { useState } from "react";
import { Search, Star, Users, Clock, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectTemplates } from "@/hooks/useProjectTemplates";
import { useProjects } from "@/hooks/useProjects";

export const ProjectTemplateGallery = () => {
  const { templates, loading, incrementUsageCount } = useProjectTemplates();
  const { createProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "software", "marketing", "design", "business", "education", "healthcare"];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: any) => {
    try {
      await incrementUsageCount(template.id);
      
      // Create project from template
      const project = await createProject({
        name: `${template.name} Project`,
        description: template.description || "",
        visibility: "private"
      });

      if (project && template.template_data?.tasks) {
        // TODO: Create tasks from template data
        console.log("Creating tasks from template:", template.template_data.tasks);
      }
    } catch (error) {
      console.error("Error using template:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "software": return "💻";
      case "marketing": return "📈";
      case "design": return "🎨";
      case "business": return "💼";
      case "education": return "📚";
      case "healthcare": return "🏥";
      default: return "📋";
    }
  };

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-readable">Project Templates</h2>
          <p className="text-muted-foreground">
            Get started quickly with pre-built project templates
          </p>
        </div>
        <Button className="glass-morphism-button bg-gradient-primary hover:shadow-glow border-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="glass-morphism-card p-4 rounded-xl border-0">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input border-0 bg-white/5"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 glass-input border-0 bg-white/5">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="glass-morphism-card border-0">
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template Grid */}
      <Tabs defaultValue="popular" className="w-full">
        <TabsList>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="all">All Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .sort((a, b) => b.usage_count - a.usage_count)
              .slice(0, 9)
              .map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onUse={handleUseTemplate}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 9)
              .map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onUse={handleUseTemplate}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onUse={handleUseTemplate}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <div className="glass-morphism-card p-12 rounded-xl border-0 text-center">
          <div className="text-muted-foreground mb-4">No templates found</div>
          <Button variant="outline" className="glass-morphism-button border-0 bg-white/5">
            Create your first template
          </Button>
        </div>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: any;
  onUse: (template: any) => void;
  getCategoryIcon: (category: string) => string;
}

const TemplateCard = ({ template, onUse, getCategoryIcon }: TemplateCardProps) => (
  <Card className="glass-morphism-card border-0 hover:shadow-glow transition-smooth hover-scale">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(template.category)}</span>
          <Badge variant="secondary" className="text-xs glass-badge">
            {template.category}
          </Badge>
        </div>
        {template.is_public && (
          <Badge variant="outline" className="text-xs glass-badge">
            <Users className="w-3 h-3 mr-1" />
            Public
          </Badge>
        )}
      </div>
      <CardTitle className="text-lg text-primary-readable font-semibold">{template.name}</CardTitle>
      <CardDescription className="line-clamp-2">
        {template.description}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {template.usage_count}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(template.created_at).toLocaleDateString()}
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => onUse(template)}
          className="glass-morphism-button bg-gradient-primary hover:shadow-glow border-0"
        >
          Use Template
        </Button>
      </div>
    </CardContent>
  </Card>
);