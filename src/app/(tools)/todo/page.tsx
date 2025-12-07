import { tasks } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export default function TodoPage() {
    
  const statusColors = {
    'Done': 'bg-green-500',
    'In Progress': 'bg-yellow-500',
    'Review': 'bg-purple-500',
    'To Do': 'bg-gray-400',
  };

  const priorityColors = {
    Urgent: "text-red-500",
    High: "text-orange-500",
    Medium: "text-yellow-600",
    Low: "text-blue-500",
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">To-Do List</h1>
      <p className="text-muted-foreground mb-8">
        Manage your tasks with a comprehensive list view.
      </p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
                </TableHead>
                <TableHead className="w-[40%]">Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox checked={task.status === "Done"} />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[task.status]}`} />
                        <span>{task.status}</span>
                     </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(task.endDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={task.assignee.avatarUrl}
                            alt={task.assignee.name}
                          />
                          <AvatarFallback>
                            {task.assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
