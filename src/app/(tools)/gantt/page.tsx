"use client";

import { tasks as allTasks } from "@/lib/data";
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
  eachWeekOfInterval,
  startOfYear,
  endOfYear,
  differenceInMonths,
  eachMonthOfInterval,
  isSaturday,
  isSunday,
  addMonths,
  subMonths,
  getDay,
  subYears,
  eachYearOfInterval,
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
import { Slider } from "@/components/ui/slider";
import type { Task } from "@/lib/types";
import { ChevronRight, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type Node = {
  id: string;
  startDate: Date;
  endDate: Date;
  y: number;
};

type TimeScale = "Day" | "Week" | "Month" | "Year";

const ROW_HEIGHT_PX = 56; // Corresponds to h-14 in Tailwind

type HeaderGroup = { label: string; units: number };

const GanttChart = () => {
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [timeScale, setTimeScale] = useState<TimeScale>("Month");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [cellWidth, setCellWidth] = useState(40);
  const [collapsed, setCollapsed] = useState(new Set<string>());

  useEffect(() => {
    // Set the current date only on the client to avoid hydration mismatch
    setCurrentDate(new Date());
  }, []);

  const toggleCollapse = (taskId: string) => {
    setCollapsed(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const tasks = useMemo(() => {
    const visibleTasks: Task[] = [];
    const taskMap = new Map(allTasks.map(t => [t.id, t]));

    for (const task of allTasks) {
      let parent = task.parentId ? taskMap.get(task.parentId) : null;
      let isVisible = true;
      while (parent) {
        if (collapsed.has(parent.id)) {
          isVisible = false;
          break;
        }
        parent = parent.parentId ? taskMap.get(parent.parentId) : null;
      }
      if (isVisible) {
        visibleTasks.push(task);
      }
    }
    return visibleTasks;
  }, [collapsed]);

  useEffect(() => {
    // Reset cell width when time scale changes for a better default UX
    switch (timeScale) {
      case "Day":
        setCellWidth(40);
        break;
      case "Week":
        setCellWidth(20);
        break;
      case "Month":
        setCellWidth(30);
        break;
      case "Year":
        setCellWidth(100);
        break;
    }
  }, [timeScale]);

  const {
    interval,
    primaryHeader,
    secondaryHeader,
    secondaryHeaderDates,
    totalUnits,
    timelineWidth,
  } = useMemo(() => {
    if (!currentDate) {
      return { interval: { start: new Date(), end: new Date() }, primaryHeader: [], secondaryHeader: [], secondaryHeaderDates: [], totalUnits: 0, timelineWidth: 0 };
    }

    let interval: { start: Date, end: Date };
    let primaryHeader: HeaderGroup[] = [];
    let secondaryHeader: HeaderGroup[] = [];
    let secondaryHeaderDates: Date[] = [];
    let totalUnits = 0;

    switch (timeScale) {
      case "Day": {
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        interval = { start: yearStart, end: yearEnd };

        secondaryHeaderDates = eachDayOfInterval(interval);
        totalUnits = differenceInDays(interval.end, interval.start) + 1;
        const months = eachMonthOfInterval(interval);
        primaryHeader = months.map(monthStart => {
          const monthEnd = endOfMonth(monthStart);
          const end = interval.end < monthEnd ? interval.end : monthEnd;
          const daysInMonth = differenceInDays(end, monthStart) + 1;
          return { label: format(monthStart, 'MMMM yyyy'), units: daysInMonth };
        });
        secondaryHeader = secondaryHeaderDates.map(day => ({
          label: format(day, 'd'),
          units: 1
        }));
        break;
      }
      case "Week": {
        const yearStart = startOfYear(currentDate);
        const intervalStart = subMonths(yearStart, 6);
        const intervalEnd = addMonths(endOfYear(currentDate), 6);
        
        const weekOptions = { weekStartsOn: 1 as const };
        const start = startOfWeek(intervalStart, weekOptions);
        const end = endOfWeek(intervalEnd, weekOptions);
        interval = { start, end };
        
        const weeks = eachWeekOfInterval({ start, end }, weekOptions);
        secondaryHeaderDates = weeks;
        totalUnits = weeks.length;
        
        const monthsInInterval = eachMonthOfInterval({ start, end });
        
        primaryHeader = monthsInInterval.map(monthStart => {
          const firstDayOfMonth = startOfWeek(monthStart, weekOptions);
          const lastDayOfMonth = endOfWeek(endOfMonth(monthStart), weekOptions);
        
          const weeksInMonth = eachWeekOfInterval({
              start: firstDayOfMonth > start ? firstDayOfMonth : start,
              end: lastDayOfMonth < end ? lastDayOfMonth : end,
          }, weekOptions);

          const weeksInMonthCount = weeksInMonth.filter(week => {
            const weekStart = week;
            const weekEnd = endOfWeek(week, weekOptions);
            return (weekStart >= start && weekStart <= end) || (weekEnd >=start && weekEnd <= end);
          }).length;
        
          return { label: format(monthStart, 'MMMM yyyy'), units: weeksInMonthCount };
        }).filter(g => g.units > 0);

        secondaryHeader = weeks.map(week => ({ 
            label: `W${format(week, 'w')}`, units: 1
        }));
        break;
      }
      case "Month": {
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        interval = { start: yearStart, end: yearEnd };

        secondaryHeaderDates = eachDayOfInterval(interval);
        totalUnits = secondaryHeaderDates.length;
        
        primaryHeader = eachMonthOfInterval(interval).map(monthStart => ({
          label: format(monthStart, 'MMMM yyyy'),
          units: differenceInDays(endOfMonth(monthStart), monthStart) + 1
        }));

        secondaryHeader = secondaryHeaderDates.map(day => ({ 
            label: format(day, 'd'), 
            units: 1
        }));
        break;
      }
      case "Year": {
        const fiveYearStart = startOfYear(subYears(currentDate, 2));
        const fiveYearEnd = endOfYear(addYears(currentDate, 2));
        interval = { start: fiveYearStart, end: fiveYearEnd };

        const months = eachMonthOfInterval(interval);
        totalUnits = months.length;
        
        primaryHeader = eachYearOfInterval(interval).map(yearStart => ({
            label: format(yearStart, 'yyyy'),
            units: 12
        }));

        secondaryHeader = months.map(month => ({ 
            label: format(month, 'MMM'), 
            units: 1 
        }));
        break;
      }
    }

    return {
      interval,
      primaryHeader,
      secondaryHeader,
      secondaryHeaderDates,
      totalUnits,
      timelineWidth: totalUnits * cellWidth,
    };
  }, [timeScale, currentDate, cellWidth]);
  
  const getTaskPosition = useCallback((taskStartDateStr: string, taskEndDateStr: string) => {
    const taskStartDate = parseISO(taskStartDateStr);
    const taskEndDate = parseISO(taskEndDateStr);

    if (!interval.start || !interval.end) return { left: 0, width: 0};

    switch (timeScale) {
        case "Day":
        case "Month":
        {
            const startOffset = differenceInDays(taskStartDate, interval.start);
            const duration = differenceInDays(taskEndDate, taskStartDate) + 1;
            const left = startOffset * cellWidth;
            const width = duration * cellWidth;
            return { left, width };
        }
        case "Week": {
            const startOffset = differenceInDays(taskStartDate, interval.start);
            const duration = differenceInDays(taskEndDate, taskStartDate) + 1;
            const left = (startOffset / 7) * cellWidth;
            const width = (duration / 7) * cellWidth;
            return { left, width };
        }
        case "Year": {
            const startOffset = differenceInMonths(taskStartDate, interval.start);
            const duration = Math.max(1, differenceInMonths(taskEndDate, taskStartDate) + 1);
            const left = startOffset * cellWidth;
            const width = duration * cellWidth;
            return { left, width };
        }
    }
    return {left: 0, width: 0};
  }, [timeScale, interval, cellWidth]);


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
    })).map(node => [node.id, node])
  ), [tasks]);
  
  let todayPositionX = -1;
  if (currentDate && interval.start && interval.end) {
      const today = new Date();
      if (today >= interval.start && today <= interval.end) {
          if (timeScale === 'Day' || timeScale === 'Month') {
              const todayOffset = differenceInDays(today, interval.start);
              if (todayOffset >= 0) {
                 todayPositionX = todayOffset * cellWidth;
              }
          }
          if (timeScale === 'Week') {
              const todayOffset = differenceInDays(today, interval.start);
              if (todayOffset >= 0) {
                todayPositionX = (todayOffset / 7) * cellWidth;
              }
          }
          if (timeScale === 'Year') {
            const todayOffset = differenceInMonths(today, interval.start);
            if (todayOffset >= 0) {
              todayPositionX = todayOffset * cellWidth;
            }
          }
      }
  }

  const getSecondaryHeaderGridTemplate = () => {
    return secondaryHeader.map(g => `${g.units * cellWidth}px`).join(' ');
  }

  const getPrimaryHeaderGridTemplate = () => {
    return primaryHeader.map(g => `${g.units * cellWidth}px`).join(' ');
  }

  const getTaskLevel = (task: Task) => {
    if (task.type === 'WBS') return 1;
    if (task.type === 'Activity') return 2;
    return 0;
  };
  
  const taskHasChildren = (taskId: string) => {
    return allTasks.some(t => t.parentId === taskId);
  };
  
  if (!currentDate) {
    return (
        <div className="p-4 md:p-8 h-full flex flex-col items-center justify-center">
            <p>Loading Gantt Chart...</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-background">
      <header className="mb-6 flex justify-between items-center gap-4 flex-wrap">
        <div>
            <h1 className="text-3xl font-bold font-headline">Gantt Chart</h1>
            <p className="text-muted-foreground mt-1">
            Visualisasikan linimasa proyek dengan dependensi tugas yang interaktif.
            </p>
        </div>
        <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2 w-40">
                <span className="text-sm text-muted-foreground">Cell Width</span>
                <Slider
                    min={timeScale === 'Year' ? 50 : (timeScale === 'Week' ? 10 : 20)}
                    max={timeScale === 'Year' ? 200 : (timeScale === 'Month' ? 60 : 80)}
                    step={5}
                    value={[cellWidth]}
                    onValueChange={(value) => setCellWidth(value[0])}
                />
            </div>
        </div>
      </header>

      <Card className="overflow-hidden flex-1 flex flex-col shadow-lg border-border">
        <div className="grid flex-1" style={{ gridTemplateColumns: `${sidebarWidth}px 1fr` }}>
          {/* Task Details Column */}
          <div ref={sidebarRef} className="relative overflow-y-auto bg-card border-r border-border">
            <Table className="relative w-full" style={{tableLayout: 'fixed'}}>
              <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
                <TableRow style={{height: `${ROW_HEIGHT_PX}px`}} className="hover:bg-transparent border-b">
                  <TableHead className="w-auto font-bold">Task</TableHead>
                  <TableHead className="w-[100px] font-bold">Start</TableHead>
                  <TableHead className="w-[100px] font-bold">End</TableHead>
                  <TableHead className="w-[100px] font-bold">Predecessor</TableHead>
                  <TableHead className="w-[90px] font-bold">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} style={{ height: `${ROW_HEIGHT_PX}px` }} className="border-b border-border/50 hover:bg-muted/50">
                    <TableCell className="truncate">
                      <div className="flex items-center gap-1" style={{ paddingLeft: `${getTaskLevel(task) * 20}px` }}>
                        {taskHasChildren(task.id) ? (
                            <button onClick={() => toggleCollapse(task.id)} className="p-1 -ml-1 rounded hover:bg-accent">
                                <ChevronRight className={cn("h-4 w-4 transition-transform", !collapsed.has(task.id) && "rotate-90")} />
                            </button>
                        ) : (
                            <div className="w-4 h-4 mr-1"></div> // Spacer
                        )}
                        <span className={`font-medium truncate ${task.type !== 'Activity' ? 'font-bold' : ''}`}>{task.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(parseISO(task.startDate), 'd MMM yy')}</TableCell>
                    <TableCell className="text-muted-foreground">{format(parseISO(task.endDate), 'd MMM yy')}</TableCell>
                    <TableCell className="text-muted-foreground truncate">{task.dependencies.join(', ')}</TableCell>
                    <TableCell className="text-muted-foreground">{`${statusProgress[task.status] || 0}%`}</TableCell>
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
          <TooltipProvider>
            <div className="relative" style={{ width: `${timelineWidth}px` }}>
              {/* Timeline Header */}
              <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm">
                <div className="grid border-b border-border/50" style={{ gridTemplateColumns: getPrimaryHeaderGridTemplate() }}>
                  {primaryHeader.map((group, i) => (
                    <div key={i} className="h-7 flex items-center justify-center border-r border-border/50">
                      <span className="font-semibold text-sm">{group.label}</span>
                    </div>
                  ))}
                </div>
                <div className="grid" style={{ gridTemplateColumns: getSecondaryHeaderGridTemplate() }}>
                  {secondaryHeader.map((group, i) => {
                    let isWeekend = false;
                    const dateIndex = timeScale === 'Week' ? i * 7 : i;
                    if ((timeScale === 'Day' || timeScale === 'Month') && secondaryHeaderDates[dateIndex]) {
                      const currentDateHeader = secondaryHeaderDates[dateIndex];
                      isWeekend = isSaturday(currentDateHeader) || isSunday(currentDateHeader);
                    }
                    return (
                      <div key={i} className={`h-7 flex items-center justify-center border-r border-b border-border/50 ${isWeekend && timeScale !== 'Week' ? 'bg-muted/60' : ''}`}>
                        <span className="font-medium text-xs">{group.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Timeline Content */}
              <div className="relative" style={{ height: `${tasks.length * ROW_HEIGHT_PX}px` }}>
                 {/* Grid Lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: getSecondaryHeaderGridTemplate() }}>
                  {secondaryHeader.map((_, i) => {
                     let isWeekend = false;
                      const dateIndex = timeScale === 'Week' ? i * 7 : i;
                      if ((timeScale === 'Day' || timeScale === 'Month') && secondaryHeaderDates[dateIndex]) {
                        const day = secondaryHeaderDates[dateIndex];
                        isWeekend = isSaturday(day) || isSunday(day);
                      } else if (timeScale === 'Week') {
                          // For week view, we shade the whole block if it contains a weekend.
                          // This implementation shades the background based on the header logic.
                          // A more precise way would be to check days within the week.
                          // For now, let's keep it simple.
                      }
                    return (
                      <div key={i} className={`border-r border-border/30 h-full ${isWeekend && timeScale !== 'Week' ? 'bg-muted/60' : ''}`}></div>
                    )
                  })}
                </div>
                 <div className="absolute inset-0 grid" style={{ gridTemplateRows: `repeat(${tasks.length}, ${ROW_HEIGHT_PX}px)` }}>
                  {Array.from({ length: tasks.length }).map((_, i) => (
                    <div key={i} className="border-b border-border/30 w-full"></div>
                  ))}
                </div>

                {/* Today Marker */}
                {todayPositionX !== -1 && (
                  <div className="absolute top-0 h-full w-px bg-primary z-20" style={{ left: `${todayPositionX + cellWidth / 2}px` }}>
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

                      const isMilestone = fromNode.startDate.getTime() === fromNode.endDate.getTime();
                      const fromPosition = getTaskPosition(fromNode.startDate.toISOString(), fromNode.endDate.toISOString());
                      const fromX = fromPosition.left + (isMilestone ? cellWidth / 2 : fromPosition.width);

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

                {/* Task Bars & Milestones */}
                {tasks.map((task, index) => {
                  const { left, width } = getTaskPosition(task.startDate, task.endDate);
                  const progress = statusProgress[task.status] || 0;
                  const isSummary = task.type !== 'Activity';
                  const isMilestone = task.startDate === task.endDate;

                  if (isMilestone) {
                    return (
                      <Tooltip key={task.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-0 flex items-center justify-center z-10"
                            style={{
                              left: `${left + cellWidth / 2}px`,
                              top: `${index * ROW_HEIGHT_PX + (ROW_HEIGHT_PX / 2)}px`,
                              transform: 'translateX(-50%) translateY(-50%)',
                            }}
                          >
                            <Diamond className="h-6 w-6 text-foreground fill-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{task.title}</p>
                          <p className="text-muted-foreground">{format(parseISO(task.startDate), 'd MMM yyyy')}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <div 
                      key={task.id} 
                      className="absolute group flex items-center"
                      style={{ 
                        top: `${index * ROW_HEIGHT_PX}px`,
                        left: `${left}px`, 
                        width: `${width}px`,
                        height: `${ROW_HEIGHT_PX}px`,
                        padding: '12px 0'
                      }}
                    >
                       <Tooltip>
                        <TooltipTrigger asChild>
                           <div
                              className="relative h-full w-full flex items-center rounded-sm text-primary-foreground overflow-hidden shadow-sm cursor-pointer"
                              style={{
                                backgroundImage: isSummary 
                                  ? `linear-gradient(to right, hsl(var(--foreground)/0.8), hsl(var(--foreground)/0.7) ${progress}%, hsl(var(--foreground)/0.25) ${progress}%)`
                                  : `linear-gradient(to right, hsl(var(--primary)/0.8), hsl(var(--primary)/0.7) ${progress}%, hsl(var(--primary)/0.25) ${progress}%)`
                              }}
                            >
                              <div className="flex items-center w-full px-2">
                                {task.assignee && !isSummary && (
                                    <Avatar className="h-6 w-6 border-2 border-background/50 flex-shrink-0">
                                        <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                                        <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  )}
                                  <span className="ml-2 truncate text-sm font-medium">{task.title}</span>
                              </div>
                              {isSummary && (
                                <>
                                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-t-[6px] border-t-transparent border-r-[8px] border-r-foreground border-b-[6px] border-b-transparent"></div>
                                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-t-[6px] border-t-transparent border-l-[8px] border-l-foreground border-b-[6px] border-b-transparent"></div>
                                </>
                              )}
                           </div>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p className="font-bold">{task.title}</p>
                           <p className="text-muted-foreground">{`${format(parseISO(task.startDate), 'd MMM')} - ${format(parseISO(task.endDate), 'd MMM yyyy')}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
           </TooltipProvider>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GanttChart;
