
"use client";

import { tasks } from "@/lib/data";
import { Card } from "@/components/ui/card";
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useRef, useCallback, useEffect } from 'react';

type Node = {
  id: string;
  startDate: Date;
  endDate: Date;
  y: number;
};

const ROW_HEIGHT_PX = 56; // Corresponds to h-14 in Tailwind

const GanttChart = () => {
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalDays = differenceInDays(monthEnd, monthStart) + 1;

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > 300 && newWidth < 800) { // Set min and max width
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const getTaskPosition = (taskStartDate: string, taskEndDate: string) => {
    const startDate = parseISO(taskStartDate);
    const endDate = parseISO(taskEndDate);

    const startOffset = differenceInDays(startDate, monthStart);
    const duration = differenceInDays(endDate, startDate) + 1;

    const left = (Math.max(0, startOffset) / totalDays) * 100;
    const width = (Math.min(duration, totalDays - startOffset) / totalDays) * 100;

    return { left, width };
  };
  
  const priorityColors: { [key: string]: string } = {
    Urgent: 'bg-red-500 hover:bg-red-600',
    High: 'bg-orange-400 hover:bg-orange-500',
    Medium: 'bg-blue-500 hover:bg-blue-600',
    Low: 'bg-green-500 hover:bg-green-600'
  };

  const statusProgress: { [key: string]: number } = {
    'Done': 100,
    'In Progress': 60,
    'Review': 80,
    'To Do': 0,
  };

  const nodeMap = new Map<string, Node>(
    tasks.map((task, index) => ({
      id: task.id,
      startDate: parseISO(task.startDate),
      endDate: parseISO(task.endDate),
      y: index * ROW_HEIGHT_PX + (ROW_HEIGHT_PX / 2),
    }))
  );

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Gantt Chart</h1>
        <p className="text-muted-foreground mt-1">
          Visualisasikan linimasa proyek dengan dependensi tugas yang interaktif.
        </p>
      </header>

      <Card className="overflow-hidden flex-1 flex flex-col">
        <div className="grid flex-1" style={{ gridTemplateColumns: `${sidebarWidth}px 1fr` }}>
          {/* Task Details Column */}
          <div ref={sidebarRef} className="relative overflow-y-auto">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="min-w-[250px] font-bold">Task</TableHead>
                  <TableHead className="font-bold">Start</TableHead>
                  <TableHead className="font-bold">End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="h-14">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="font-medium truncate">{task.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(parseISO(task.startDate), 'd MMM')}</TableCell>
                    <TableCell className="text-muted-foreground">{format(parseISO(task.endDate), 'd MMM')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <div 
              className="absolute h-full w-2 top-0 right-0 cursor-col-resize select-none"
              onMouseDown={startResizing}
             >
                <div className="h-full w-[1px] bg-border hover:bg-primary transition-colors mx-auto"></div>
             </div>
          </div>
          
          {/* Timeline Column */}
          <div className="overflow-x-auto">
            <div className="relative" style={{ minWidth: `${totalDays * 60}px` }}>
              {/* Timeline Header */}
              <div className="sticky top-0 z-20 grid bg-secondary/80 backdrop-blur-sm" style={{ gridTemplateColumns: `repeat(${totalDays}, 60px)` }}>
                {daysInMonth.map((day, i) => (
                  <div key={i} className="h-14 flex flex-col items-center justify-center border-r border-b">
                    <span className="text-xs text-muted-foreground">{format(day, 'E')}</span>
                    <span className="font-bold text-lg">{format(day, 'd')}</span>
                  </div>
                ))}
              </div>
              
              {/* Timeline Content */}
              <div className="relative" style={{ height: `${tasks.length * ROW_HEIGHT_PX}px` }}>
                {/* Dependency Lines */}
                <svg width="100%" height="100%" className="absolute top-0 left-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                      <polygon points="0 0, 8 3, 0 6" className="fill-primary" />
                    </marker>
                  </defs>
                  {tasks.map((task) => 
                    task.dependencies.map(depId => {
                      const fromNode = nodeMap.get(depId);
                      const toNode = nodeMap.get(task.id);
                      if (!fromNode || !toNode) return null;

                      const fromPosition = getTaskPosition(fromNode.startDate.toISOString(), fromNode.endDate.toISOString());
                      const fromX = (fromPosition.left + fromPosition.width) / 100 * (totalDays * 60);

                      const toPosition = getTaskPosition(toNode.startDate.toISOString(), toNode.endDate.toISOString());
                      const toX = toPosition.left / 100 * (totalDays * 60);
                      
                      const startPointX = fromX - 1;
                      const endPointX = toX - 8; 

                      return (
                        <path 
                          key={`${depId}-${task.id}`}
                          d={`M ${startPointX} ${fromNode.y} H ${startPointX + 15} V ${toNode.y} H ${endPointX}`}
                          stroke="hsl(var(--primary))"
                          strokeWidth="1.5"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                        />
                      )
                    })
                  )}
                </svg>

                {/* Task Bars */}
                {tasks.map((task, index) => {
                  const { left, width } = getTaskPosition(task.startDate, task.endDate);
                  const progress = statusProgress[task.status] || 0;
                  return (
                    <div 
                      key={task.id} 
                      className="absolute flex items-center"
                      style={{ 
                        top: `${index * ROW_HEIGHT_PX}px`,
                        left: `0`,
                        width: '100%',
                        height: `${ROW_HEIGHT_PX}px`,
                      }}
                    >
                      <div className="relative w-full h-full border-b">
                        <div
                          className="absolute h-8 top-1/2 -translate-y-1/2 flex items-center transition-all duration-200 rounded-sm"
                          style={{ left: `${left}%`, width: `${width}%`}}
                          title={`${task.title} (${format(parseISO(task.startDate), 'MMM d')} - ${format(parseISO(task.endDate), 'MMM d')})`}
                        >
                           <div className={`absolute inset-0 rounded-sm transition-colors ${priorityColors[task.priority]}`}>
                              <div 
                                className="absolute inset-y-0 left-0 bg-black/20 rounded-l-sm"
                                style={{ width: `${progress}%`}}
                              ></div>
                           </div>
                           <span className="relative truncate text-white font-medium text-xs z-10 ml-2">{task.title}</span>
                        </div>
                        
                        {task.assignee && (
                          <div 
                            className="absolute flex items-center top-1/2 -translate-y-1/2" 
                            style={{ left: `calc(${left}% + ${width}% + 8px)` }}
                          >
                              <Avatar className="h-7 w-7 border-2 border-background">
                                  <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                                  <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GanttChart;
