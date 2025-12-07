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
  addYears,
  startOfWeek,
  endOfWeek,
  differenceInWeeks,
  eachWeekOfInterval,
  startOfYear,
  endOfYear,
  differenceInMonths,
  eachMonthOfInterval,
  differenceInYears,
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
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";

type Node = {
  id: string;
  startDate: Date;
  endDate: Date;
  y: number;
};

type TimeScale = "Day" | "Week" | "Month" | "Year";

const ROW_HEIGHT_PX = 56; // Corresponds to h-14 in Tailwind

const GanttChart = () => {
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [timeScale, setTimeScale] = useState<TimeScale>("Month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    interval,
    headerGroups,
    totalUnits,
    unitWidth,
    timelineWidth,
  } = useMemo(() => {
    let interval;
    let headerGroups: { label: string; units: number }[] = [];
    let totalUnits = 0;
    let unitWidth = 0;

    const projectStart = new Date(Math.min(...tasks.map(t => parseISO(t.startDate).getTime())));
    const projectEnd = new Date(Math.max(...tasks.map(t => parseISO(t.endDate).getTime())));

    switch (timeScale) {
      case "Day":
        unitWidth = 60;
        interval = { start: startOfWeek(projectStart), end: endOfWeek(projectEnd) };
        totalUnits = differenceInDays(interval.end, interval.start) + 1;
        const monthsInDayView = eachMonthOfInterval(interval);
        headerGroups = monthsInDayView.map(monthStart => {
          const monthEnd = endOfMonth(monthStart);
          const end = interval.end < monthEnd ? interval.end : monthEnd;
          const daysInMonth = differenceInDays(end, monthStart) + 1;
          return { label: format(monthStart, 'MMMM yyyy'), units: daysInMonth };
        });
        break;
      case "Week":
        unitWidth = 100;
        interval = { start: startOfWeek(projectStart), end: endOfWeek(projectEnd) };
        totalUnits = differenceInWeeks(interval.end, interval.start) + 1;
        headerGroups = eachWeekOfInterval(interval).map(week => ({ label: `W${format(week, 'w')}`, units: 1 }));
        break;
      case "Month":
        unitWidth = 200;
        interval = { start: startOfYear(currentDate), end: endOfYear(currentDate) };
        totalUnits = 12;
        headerGroups = eachMonthOfInterval(interval).map(month => ({ label: format(month, 'MMM'), units: 1 }));
        break;
      case "Year":
        unitWidth = 500;
        const startYear = startOfYear(projectStart);
        const endYear = endOfYear(projectEnd);
        interval = { start: startYear, end: endYear };
        totalUnits = differenceInYears(endYear, startYear) + 1;
        headerGroups = Array.from({ length: totalUnits }, (_, i) => ({ label: format(addYears(startYear, i), 'yyyy'), units: 1 }));
        break;
    }
    
    return {
      interval,
      headerGroups,
      totalUnits,
      unitWidth,
      timelineWidth: totalUnits * unitWidth,
    };
  }, [timeScale, currentDate]);
  
  const getTaskPosition = useCallback((taskStartDateStr: string, taskEndDateStr: string) => {
    const taskStartDate = parseISO(taskStartDateStr);
    const taskEndDate = parseISO(taskEndDateStr);

    let startOffset = 0;
    let duration = 0;

    switch (timeScale) {
        case "Day":
            startOffset = differenceInDays(taskStartDate, interval.start);
            duration = differenceInDays(taskEndDate, taskStartDate) + 1;
            break;
        case "Week":
            startOffset = differenceInWeeks(taskStartDate, interval.start);
            duration = Math.max(1, differenceInWeeks(taskEndDate, taskStartDate));
            break;
        case "Month":
            startOffset = differenceInMonths(taskStartDate, interval.start);
            duration = differenceInMonths(taskEndDate, taskStartDate) + 1;
            break;
        case "Year":
            startOffset = differenceInYears(taskStartDate, interval.start);
            duration = Math.max(1, differenceInYears(taskEndDate, taskStartDate));
            break;
    }
    
    const left = startOffset * unitWidth;
    const width = duration * unitWidth;
    return { left, width };
  }, [timeScale, interval, unitWidth]);


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
  
  const statusProgress: { [key: string]: number } = {
    'Done': 100,
    'In Progress': 60,
    'Review': 80,
    'To Do': 0,
  };

  const nodeMap = useMemo(() => new Map<string, Node>(
    tasks.map((task, index) => ({
      id: task.id,
      startDate: parseISO(task.startDate),
      endDate: parseISO(task.endDate),
      y: index * ROW_HEIGHT_PX + (ROW_HEIGHT_PX / 2),
    }))
  ), []);
  
  const todayOffset = differenceInDays(new Date(), interval.start);
  let todayPositionX = -1;
  if (timeScale === "Day" && todayOffset >= 0 && todayOffset < totalUnits) {
      todayPositionX = todayOffset * unitWidth;
  }


  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-background">
      <header className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">Gantt Chart</h1>
            <p className="text-muted-foreground mt-1">
            Visualisasikan linimasa proyek dengan dependensi tugas yang interaktif.
            </p>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {(["Day", "Week", "Month", "Year"] as TimeScale[]).map(scale => (
                <Button 
                    key={scale}
                    variant={timeScale === scale ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeScale(scale)}
                    className="h-8 px-3"
                >
                    {scale}
                </Button>
            ))}
        </div>
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
            <div className="relative" style={{ width: `${timelineWidth}px` }}>
              {/* Timeline Header */}
              <div className="sticky top-0 z-20 grid bg-card/95 backdrop-blur-sm" style={{ gridTemplateColumns: `repeat(${totalUnits}, ${unitWidth}px)` }}>
                {headerGroups.map((group, i) => (
                  <div key={i} className={`h-14 flex items-center justify-center border-r border-b border-border/50`}>
                    <span className="font-semibold text-base">{group.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Timeline Content */}
              <div className="relative" style={{ height: `${tasks.length * ROW_HEIGHT_PX}px` }}>
                 {/* Grid Lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalUnits}, ${unitWidth}px)` }}>
                  {Array.from({ length: totalUnits }).map((_, i) => (
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
                  <div className="absolute top-0 h-full w-px bg-primary z-20" style={{ left: `${todayPositionX + unitWidth / 2}px` }}>
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
                      className="absolute group"
                      style={{ 
                        top: `${index * ROW_HEIGHT_PX}px`,
                        left: `${left}px`, 
                        width: `${width}px`,
                        height: `${ROW_HEIGHT_PX}px`,
                        padding: '12px 0'
                      }}
                    >
                      <div
                        className="relative h-full w-full flex items-center rounded-sm text-primary-foreground overflow-hidden"
                        style={{
                          backgroundImage: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)/0.9) ${progress}%, hsl(var(--primary)/0.4) ${progress}%)`
                        }}
                        title={`${task.title} (${format(parseISO(task.startDate), 'MMM d')} - ${format(parseISO(task.endDate), 'MMM d')})`}
                      >
                         <div className="flex items-center w-full px-2">
                           {task.assignee && (
                              <Avatar className="h-6 w-6 border-2 border-background/50 flex-shrink-0">
                                  <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                                  <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <span className="ml-2 truncate text-sm font-medium">{task.title}</span>
                         </div>
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

    