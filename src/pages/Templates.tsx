import { TaskCreationSystem } from "@/components/tasks/TaskCreationSystem";

const TaskCreation = () => {
  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-primary-readable mb-2">Task Creation</h1>
          <p className="text-muted-foreground text-lg">
            Manage your projects, tasks, and subtasks in a hierarchical file system view
          </p>
        </div>
        <TaskCreationSystem />
      </div>
    </div>
  );
};

export default TaskCreation;