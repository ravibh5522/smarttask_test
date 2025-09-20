import { memo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export const ProjectCardSkeleton = memo(function ProjectCardSkeleton() {
  return (
    <div className="p-3 rounded-lg border border-white/10 glass-morphism-card mx-2 my-1">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </div>
  );
});

export const TaskCardSkeleton = memo(function TaskCardSkeleton() {
  return (
    <div className="p-3 rounded-lg border border-white/10 glass-morphism-card mx-2 my-1">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-2/3 mb-2" />
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </div>
  );
});

export const SubtaskCardSkeleton = memo(function SubtaskCardSkeleton() {
  return (
    <div className="p-3 rounded-lg border border-white/10 glass-morphism-card mx-2 my-1">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </div>
  );
});

export const ColumnLoadingSkeleton = memo(function ColumnLoadingSkeleton({ 
  title, 
  count = 3 
}: { 
  title: string; 
  count?: number;
}) {
  return (
    <Card className="glass-morphism-card border-0 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="w-8 h-8" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-2">
          {[...Array(count)].map((_, i) => {
            if (title === "Projects") return <ProjectCardSkeleton key={i} />;
            if (title === "Tasks") return <TaskCardSkeleton key={i} />;
            return <SubtaskCardSkeleton key={i} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
});

export { Skeleton };
