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
  isToday,
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
const DAY_WIDTH_PX = 60;

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

    const leftPx = Math.max(0, startOffset) * DAY_WIDTH_PX;
    const widthPx = Math.min(duration, totalDays - startOffset) * DAY_WIDTH_PX;

    return { left: leftPx, width: widthPx };
  };
  
  const priorityColors: { [key: string]: string } = {
    Urgent: 'bg-red-500',
    High: 'bg-orange-400',
    Medium: 'bg-blue-500',
    Low: 'bg-green-500'
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
  
  const todayOffset = differenceInDays(new Date(), monthStart);
  const todayPositionX = todayOffset >= 0 && todayOffset <= totalDays ? todayOffset * DAY_WIDTH_PX : -1;


  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-background">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Gantt Chart</h1>
        <p className="text-muted-foreground mt-1">
          Visualisasikan linimasa proyek dengan dependensi tugas yang interaktif.
        </p>
      </header>

      <Card className="overflow-hidden flex-1 flex flex-col shadow-lg border-border">
        <div className="grid flex-1" style={{ gridTemplateColumns: `${sidebarWidth}px 1fr` }}>
          {/* Task Details Column */}
          <div ref={sidebarRef} className="relative overflow-y-auto bg-card border-r border-border">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
                <TableRow className="h-14 hover:bg-transparent border-b">
                  <TableHead className="min-w-[250px] font-bold">Task</TableHead>
                  <TableHead className="font-bold">Start</TableHead>
                  <TableHead className="font-bold">End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="h-14 border-b border-border/50">
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
              className="absolute h-full w-2 top-0 right-0 cursor-col-resize select-none group"
              onMouseDown={startResizing}
             >
                <div className="h-full w-px bg-border group-hover:bg-primary transition-colors mx-auto"></div>
             </div>
          </div>
          
          {/* Timeline Column */}
          <div className="overflow-x-auto bg-card">
            <div className="relative" style={{ minWidth: `${totalDays * DAY_WIDTH_PX}px` }}>
              {/* Timeline Header */}
              <div className="sticky top-0 z-20 grid bg-card/95 backdrop-blur-sm" style={{ gridTemplateColumns: `repeat(${totalDays}, ${DAY_WIDTH_PX}px)` }}>
                {daysInMonth.map((day, i) => (
                  <div key={i} className={`h-14 flex flex-col items-center justify-center border-r border-b border-border/50 ${isToday(day) ? 'bg-primary/10' : ''}`}>
                    <span className="text-xs text-muted-foreground">{format(day, 'E')}</span>
                    <span className="font-semibold text-base">{format(day, 'd')}</span>
                  </div>
                ))}
              </div>
              
              {/* Timeline Content */}
              <div className="relative" style={{ height: `${tasks.length * ROW_HEIGHT_PX}px` }}>
                 {/* Grid Lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, ${DAY_WIDTH_PX}px)` }}>
                  {Array.from({ length: totalDays }).map((_, i) => (
                    <div key={i} className="border-r border-border/30 h-full"></div>
                  ))}
                </div>
                 <div className="absolute inset-0 grid" style={{ gridTemplateRows: `repeat(${tasks.length}, ${ROW_HEIGHT_PX}px)` }}>
                  {Array.from({ length: tasks.length }).map((_, i) => (
                    <div key={i} className="border-b border-border/30 w-full"></div>
                  ))}
                </div>

                {/* Today Marker */}
                {todayPositionX !== -1 && (
                  <div className="absolute top-0 h-full w-px bg-primary z-20" style={{ left: `${todayPositionX + DAY_WIDTH_PX / 2}px` }}>
                    <div className="absolute -top-1 -translate-x-1/2 left-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full px-1.5 py-0.5">
                      Today
                    </div>
                  </div>
                )}
                
                {/* Dependency Lines */}
                <svg width="100%" height="100%" className="absolute top-0 left-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                      <polygon points="0 0, 8 3, 0 6" className="fill-muted-foreground/50" />
                    </marker>
                  </defs>
                  {tasks.map((task) => 
                    task.dependencies.map(depId => {
                      const fromNode = nodeMap.get(depId);
                      const toNode = nodeMap.get(task.id);
                      if (!fromNode || !toNode) return null;

                      const fromPosition = getTaskPosition(fromNode.startDate.toISOString(), fromNode.endDate.toISOString());
                      const fromX = fromPosition.left + fromPosition.width;

                      const toPosition = getTaskPosition(toNode.startDate.toISOString(), toNode.endDate.toISOString());
                      const toX = toPosition.left;
                      
                      const startPointX = fromX + 4;
                      const endPointX = toX - 12;
                      const curve = 30;

                      return (
                        <path 
                          key={`${depId}-${task.id}`}
                          d={`M ${startPointX} ${fromNode.y} C ${startPointX + curve} ${fromNode.y}, ${endPointX - curve} ${toNode.y}, ${endPointX} ${toNode.y}`}
                          stroke="hsl(var(--muted-foreground) / 0.5)"
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
                      className="absolute flex items-center group"
                      style={{ 
                        top: `${index * ROW_HEIGHT_PX}px`,
                        left: `0`,
                        width: '100%',
                        height: `${ROW_HEIGHT_PX}px`,
                      }}
                    >
                        <div
                          className="absolute h-8 top-1/2 -translate-y-1/2 flex items-center rounded-md"
                          style={{ 
                            left: `${left}px`, 
                            width: `${width}px`,
                            backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.8) ${progress}%, hsl(var(--primary) / 0.3) ${progress}%)`
                          }}
                          title={`${task.title} (${format(parseISO(task.startDate), 'MMM d')} - ${format(parseISO(task.endDate), 'MMM d')})`}
                        >
                        </div>
                         <div 
                            className="absolute flex items-center top-1/2 -translate-y-1/2" 
                            style={{ left: `${left + width + 8}px` }}
                          >
                              <span className="truncate text-foreground font-medium text-sm z-10">{task.title}</span>
                              {task.assignee && (
                                <Avatar className="h-6 w-6 border-2 border-background ml-2">
                                    <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                                    <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
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

    