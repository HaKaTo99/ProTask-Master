"use client";

import { tasks, teamMembers } from "@/lib/data";
import type { Task, TaskStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";

const columns: { title: TaskStatus; tasks: Task[] }[] = [
  { title: "To Do", tasks: tasks.filter((t) => t.status === "To Do") },
  { title: "In Progress", tasks: tasks.filter((t) => t.status === "In Progress") },
  { title: "Review", tasks: tasks.filter((t) => t.status === "Review") },
  { title: "Done", tasks: tasks.filter((t) => t.status === "Done") },
];

const priorityStyles = {
  Urgent: "border-red-500",
  High: "border-orange-500",
  Medium: "border-yellow-500",
  Low: "border-blue-500",
};

const TaskCard = ({ task }: { task: Task }) => (
  <Card className={`mb-4 bg-card hover:shadow-md transition-shadow border-l-4 ${priorityStyles[task.priority]}`}>
    <CardContent className="p-4">
      <p className="font-semibold mb-2">{task.title}</p>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <Badge variant={task.priority === 'Urgent' || task.priority === 'High' ? 'destructive' : 'secondary'}>
          {task.priority}
        </Badge>
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </CardContent>
  </Card>
);

const KanbanColumn = ({ title, tasks }: { title: string; tasks: Task[] }) => (
  <div className="w-[300px] flex-shrink-0">
    <Card className="bg-secondary/50">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {title} 
          <Badge variant="outline" className="h-5">{tasks.length}</Badge>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <PlusCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </CardContent>
    </Card>
  </div>
);

export default function KanbanBoard() {
  return (
    <div className="flex gap-6 pb-4">
      {columns.map((col) => (
        <KanbanColumn key={col.title} title={col.title} tasks={col.tasks} />
      ))}
    </div>
  );
}
