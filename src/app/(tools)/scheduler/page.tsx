"use client";

import * as React from "react";
import { tasks as initialTasks, teamMembers } from "@/lib/data-gantt";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SchedulerPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const tasksWithAssignees = initialTasks.map(task => {
    const assignee = teamMembers.find(member => member.id === task.assigneeId);
    return { ...task, assignee };
  });

  const taskDates = tasksWithAssignees.map(task => parseISO(task.startDate));

  const selectedDayTasks = date
    ? tasksWithAssignees.filter(task => isSameDay(parseISO(task.startDate), date) || isSameDay(parseISO(task.endDate), date))
    : [];
    
  const priorityColors = {
    Urgent: 'bg-red-500',
    High: 'bg-accent',
    Medium: 'bg-yellow-500',
    Low: 'bg-blue-500'
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Scheduler</h1>
      <p className="text-muted-foreground mb-8">
        Plan your work and visualize deadlines with an interactive calendar.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              modifiers={{
                task: taskDates,
              }}
              modifiersStyles={{
                task: {
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary))',
                },
              }}
            />
          </CardContent>
        </Card>
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>
                Tasks for {date ? format(date, "MMMM dd, yyyy") : "..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayTasks.length > 0 ? (
                <ul className="space-y-4">
                  {selectedDayTasks.map(task => (
                    <li key={task.id} className="flex items-start gap-3">
                       <div className={`mt-1.5 w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                       <div>
                          <p className="font-semibold">{task.title}</p>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            {task.assignee && (
                               <Avatar className="h-5 w-5">
                                <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <span>{task.assignee?.name || 'Unassigned'}</span>
                          </div>
                       </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No tasks for this day.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
