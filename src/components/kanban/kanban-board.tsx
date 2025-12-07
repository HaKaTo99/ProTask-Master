"use client";

import { teamMembers } from "@/lib/data";
import type { Task, TaskStatus, TeamMember } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";


const initialTasks: Omit<Task, 'type' | 'isCritical' | 'dependencies'>[] = [
  { id: 'act-1.1.1', parentId: 'wbs-1.1', title: 'Riset Pasar & Analisis Kebutuhan', description: 'Menganalisis target pasar dan kebutuhan pengguna.', status: 'Done', priority: 'High', assigneeId: 'user-3', startDate: '2025-01-01T00:00:00.000Z', endDate: '2025-01-31T00:00:00.000Z' },
  { id: 'act-1.1.2', parentId: 'wbs-1.1', title: 'Desain Arsitektur Sistem', description: 'Merancang arsitektur teknis dan model data.', status: 'In Progress', priority: 'High', assigneeId: 'user-5', startDate: '2025-02-01T00:00:00.000Z', endDate: '2025-02-28T00:00:00.000Z' },
  { id: 'act-1.2.1', parentId: 'wbs-1.2', title: 'Pengaturan Lingkungan Pengembangan', description: 'Menyiapkan repositori, CI/CD, dan cloud environment.', status: 'In Progress', priority: 'High', assigneeId: 'user-4', startDate: '2025-03-01T00:00:00.000Z', endDate: '2025-03-15T00:00:00.000Z' },
  { id: 'act-1.2.2', parentId: 'wbs-1.2', title: 'Pengembangan API Backend', description: 'Membangun endpoint API utama untuk aplikasi.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-5', startDate: '2025-03-16T00:00:00.000Z', endDate: '2025-05-31T00:00:00.000Z' },
  { id: 'act-1.2.3', parentId: 'wbs-1.2', title: 'Implementasi Skema Database', description: 'Menerapkan model data ke dalam database.', status: 'To Do', priority: 'High', assigneeId: 'user-2', startDate: '2025-03-16T00:00:00.000Z', endDate: '2025-04-30T00:00:00.000Z' },
  { id: 'act-1.3.1', parentId: 'wbs-1.3', title: 'Pengembangan UI/UX Frontend', description: 'Membangun antarmuka pengguna sesuai dengan desain.', status: 'To Do', priority: 'High', assigneeId: 'user-1', startDate: '2025-07-01T00:00:00.000Z', endDate: '2025-08-31T00:00:00.000Z' },
  { id: 'act-1.3.2', parentId: 'wbs-1.3', title: 'Pengujian Integrasi', description: 'Menguji integrasi antara frontend dan backend.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-09-01T00:00:00.000Z', endDate: '2025-09-30T00:00:00.000Z' },
  { id: 'act-1.3.3', parentId: 'wbs-1.3', title: 'Pengujian Penerimaan Pengguna (UAT)', description: 'Melibatkan pengguna akhir untuk pengujian beta.', status: 'Review', priority: 'Medium', assigneeId: 'user-3', startDate: '2025-10-01T00:00:00.000Z', endDate: '2025-10-31T00:00:00.000Z' },
  { id: 'act-1.4.1', parentId: 'wbs-1.4', title: 'Persiapan Infrastruktur Produksi', description: 'Menyiapkan server produksi dan melakukan hardening.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-5', startDate: '2025-11-01T00:00:00.000Z', endDate: '2025-11-30T00:00:00.000Z' },
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
  const [tasks] = useState<Task[]>(
    initialTasks.map(t => ({
      ...t,
      dependencies: [],
      type: 'Activity',
      isCritical: false
    }))
  );

  const tasksWithAssignees = useMemo(() => {
    const memberMap = new Map(teamMembers.map(m => [m.id, m]));
    return tasks.map(task => ({
      ...task,
      assignee: task.assigneeId ? memberMap.get(task.assigneeId) : undefined
    }));
  }, [tasks]);


  const columns: { title: TaskStatus; tasks: Task[] }[] = [
    { title: "To Do", tasks: tasksWithAssignees.filter((t) => t.status === "To Do") },
    { title: "In Progress", tasks: tasksWithAssignees.filter((t) => t.status === "In Progress") },
    { title: "Review", tasks: tasksWithAssignees.filter((t) => t.status === "Review") },
    { title: "Done", tasks: tasksWithAssignees.filter((t) => t.status === "Done") },
  ];

  return (
    <div className="flex gap-6 pb-4">
      {columns.map((col) => (
        <KanbanColumn key={col.title} title={col.title} tasks={col.tasks} />
      ))}
    </div>
  );
}
