"use client";

import { tasks as initialTasks } from "@/lib/data";
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
  getISOWeek,
  addDays,
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
import { Input } from "@/components/ui/input";


type Node = {
  id: string;
  startDate: Date;
  endDate: Date;
  y: number;
  isCritical?: boolean;
};

type TimeScale = "Day" | "Week" | "Month" | "Year";

const ROW_HEIGHT_PX = 56; // Corresponds to h-14 in Tailwind

type HeaderGroup = { label: string; units: number };

// New component for inline editing
const EditableCell = ({ value, onSave }: { value: string, onSave: (newValue: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(text);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onSave(text);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setText(value); // Revert changes
    }
  };

  if (isEditing) {
    return (
      <Input
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-8 p-1 -m-1"
      />
    );
  }

  return <div onDoubleClick={handleDoubleClick} className="truncate cursor-pointer">{value}</div>;
};


const GanttChart = () => {
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [timeScale, setTimeScale] = useState<TimeScale>("Month");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [cellWidth, setCellWidth] = useState(40);
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  
  const [draggingInfo, setDraggingInfo] = useState<{
    task: Task;
    action: 'move' | 'resize-end';
    initialX: number;
    initialStartDate: Date;
    initialEndDate: Date;
  } | null>(null);

  const handleUpdateTask = (taskId: string, newTitle: string) => {
    setAllTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, title: newTitle } : task
      )
    );
  };

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
  }, [collapsed, allTasks]);

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
        setCellWidth(10);
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
        const yearEnd = endOfYear(currentDate);
        interval = { start: yearStart, end: yearEnd };
        
        secondaryHeaderDates = eachDayOfInterval(interval);
        totalUnits = secondaryHeaderDates.length;

        const monthsInInterval = eachMonthOfInterval({ start: interval.start, end: interval.end });
        primaryHeader = monthsInInterval.map(monthStart => {
            const start = new Date(Math.max(interval.start.getTime(), monthStart.getTime()));
            const end = new Date(Math.min(interval.end.getTime(), endOfMonth(monthStart).getTime()));
            const daysInMonth = differenceInDays(end, start) + 1;
            return { label: format(monthStart, 'MMMM yyyy'), units: daysInMonth };
        });
        
        const weeksInInterval = eachWeekOfInterval(interval, { weekStartsOn: 1 });
        secondaryHeader = weeksInInterval.map(weekStart => {
            const start = new Date(Math.max(interval.start.getTime(), weekStart.getTime()));
            const end = new Date(Math.min(interval.end.getTime(), endOfWeek(weekStart, { weekStartsOn: 1 }).getTime()));
            const daysInWeek = differenceInDays(end, start) + 1;
            return { label: `W${getISOWeek(weekStart)}`, units: daysInWeek };
        });
        break;
      }
      case "Month": {
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        interval = { start: yearStart, end: yearEnd };

        secondaryHeaderDates = eachDayOfInterval(interval);
        totalUnits = secondaryHeaderDates.length;
        
        primaryHeader = eachYearOfInterval(interval).map(yearStart => ({
            label: format(yearStart, 'yyyy'),
            units: differenceInDays(endOfYear(yearStart), yearStart) + 1
        }));
        
        secondaryHeader = eachMonthOfInterval(interval).map(monthStart => {
            const daysInMonth = differenceInDays(endOfMonth(monthStart), monthStart) + 1;
            return { label: format(monthStart, 'MMM'), units: daysInMonth };
        });
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

    let finalTimelineWidth = 0;
     if (timeScale === 'Year') {
      finalTimelineWidth = totalUnits * cellWidth;
    } else if (timeScale === 'Week') {
        finalTimelineWidth = secondaryHeader.reduce((acc, h) => acc + h.units * cellWidth, 0);
    } else {
      finalTimelineWidth = totalUnits * cellWidth;
    }

    return {
      interval,
      primaryHeader,
      secondaryHeader,
      secondaryHeaderDates,
      totalUnits,
      timelineWidth: finalTimelineWidth,
    };
  }, [timeScale, currentDate, cellWidth]);
  
  const getTaskPosition = useCallback((taskStartDateStr: string, taskEndDateStr: string) => {
    const taskStartDate = parseISO(taskStartDateStr);
    const taskEndDate = parseISO(taskEndDateStr);

    if (!interval.start || !interval.end) return { left: 0, width: 0};

    switch (timeScale) {
        case "Day":
        case "Week":
        case "Month":
        {
            const startOffset = differenceInDays(taskStartDate, interval.start);
            const duration = differenceInDays(taskEndDate, taskStartDate) + 1;
            const left = startOffset * cellWidth;
            const width = duration * cellWidth;
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
  
  const handleDragStart = (e: React.MouseEvent, task: Task, action: 'move' | 'resize-end') => {
    if (task.type !== 'Activity' || task.startDate === task.endDate) return;
    e.preventDefault();
    e.stopPropagation();

    setDraggingInfo({
      task,
      action,
      initialX: e.clientX,
      initialStartDate: parseISO(task.startDate),
      initialEndDate: parseISO(task.endDate),
    });
  };

  const handleDragging = useCallback((e: MouseEvent) => {
    if (!draggingInfo) return;

    const dx = e.clientX - draggingInfo.initialX;
    let daysMoved = 0;
    
    if (timeScale === 'Year') {
      const monthsMoved = Math.round(dx / cellWidth);
      daysMoved = monthsMoved * 30; // Approximation
    } else {
      daysMoved = Math.round(dx / cellWidth);
    }
    
    let newStartDate = draggingInfo.initialStartDate;
    let newEndDate = draggingInfo.initialEndDate;

    if (draggingInfo.action === 'move') {
      const duration = differenceInDays(draggingInfo.initialEndDate, draggingInfo.initialStartDate);
      newStartDate = addDays(draggingInfo.initialStartDate, daysMoved);
      newEndDate = addDays(newStartDate, duration);
    } else if (draggingInfo.action === 'resize-end') {
      newEndDate = addDays(draggingInfo.initialEndDate, daysMoved);
      if (differenceInDays(newEndDate, newStartDate) < 0) {
        newEndDate = newStartDate;
      }
    }

    setAllTasks(prevTasks => prevTasks.map(t => {
      if (t.id === draggingInfo.task.id) {
        return {
          ...t,
          startDate: newStartDate.toISOString(),
          endDate: newEndDate.toISOString(),
        };
      }
      return t;
    }));
  }, [draggingInfo, cellWidth, timeScale]);

  const handleDragEnd = useCallback(() => {
    if (draggingInfo) {
      setDraggingInfo(null);
    }
  }, [draggingInfo]);
  
  useEffect(() => {
    if (draggingInfo) {
      document.body.style.cursor = draggingInfo.action === 'move' ? 'grabbing' : 'ew-resize';
      window.addEventListener('mousemove', handleDragging);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleDragging);
      window.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = 'default';
    };
  }, [draggingInfo, handleDragging, handleDragEnd]);
  
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
      isCritical: task.isCritical,
    })).map(node => [node.id, node])
  ), [tasks]);
  
  let todayPositionX = -1;
  if (currentDate && interval.start && interval.end) {
      const today = new Date();
      if (today >= interval.start && today <= interval.end) {
          if (timeScale === 'Day' || timeScale === 'Month' || timeScale === 'Week') {
              const todayOffset = differenceInDays(today, interval.start);
              if (todayOffset >= 0) {
                 todayPositionX = todayOffset * cellWidth;
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

 const getGridTemplate = (headerGroups: HeaderGroup[], forTimeScale: TimeScale) => {
    if (forTimeScale === 'Week') {
        return headerGroups.map(g => `${g.units * cellWidth}px`).join(' ');
    }
    return headerGroups.map(g => `${g.units * cellWidth}px`).join(' ');
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
                    min={timeScale === 'Year' ? 50 : (timeScale === 'Week' || timeScale === 'Month' ? 10 : 20)}
                    max={timeScale === 'Year' ? 200 : (timeScale === 'Month' ? 40 : 80)}
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
                  <TableRow key={task.id} style={{ height: `${ROW_HEIGHT_PX}px` }} className={cn("border-b border-border/50 hover:bg-muted/50", task.isCritical && "bg-accent/10 hover:bg-accent/20")}>
                    <TableCell>
                      <div className="flex items-center gap-1" style={{ paddingLeft: `${getTaskLevel(task) * 20}px` }}>
                        {taskHasChildren(task.id) ? (
                            <button onClick={() => toggleCollapse(task.id)} className="p-1 -ml-1 rounded hover:bg-accent">
                                <ChevronRight className={cn("h-4 w-4 transition-transform", !collapsed.has(task.id) && "rotate-90")} />
                            </button>
                        ) : (
                           task.type !== 'EPS' && <div className="w-4 h-4 mr-1"></div> // Spacer
                        )}
                        <span className={`font-medium ${task.type !== 'Activity' ? 'font-bold' : ''}`}>
                          <EditableCell
                            value={task.title}
                            onSave={(newTitle) => handleUpdateTask(task.id, newTitle)}
                          />
                        </span>
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
                <div className="grid border-b border-border/50" style={{ gridTemplateColumns: getGridTemplate(primaryHeader, timeScale) }}>
                  {primaryHeader.map((group, i) => (
                    <div key={i} className="h-7 flex items-center justify-center border-r border-border/50">
                      <span className="font-semibold text-sm">{group.label}</span>
                    </div>
                  ))}
                </div>
                 <div className="grid" style={{ gridTemplateColumns: getGridTemplate(secondaryHeader, timeScale === 'Week' ? 'Day' : timeScale) }}>
                  {(timeScale === 'Week' ? secondaryHeaderDates : secondaryHeader).map((group, i) => {
                     let isDayScale = timeScale === 'Day' || timeScale === 'Week' || timeScale === 'Month';
                     let isWeekend = false;
                     if(isDayScale && secondaryHeaderDates[i]) {
                         const day = secondaryHeaderDates[i];
                         isWeekend = isSaturday(day) || isSunday(day);
                     }
                    const label = timeScale === 'Week' ? format(secondaryHeaderDates[i], 'd') : group.label;
                    return (
                      <div key={i} className={cn(
                        "h-7 flex items-center justify-center border-r border-b border-border/50",
                         isWeekend && 'bg-muted/60'
                      )}>
                        <span className="font-medium text-xs">{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Timeline Content */}
              <div className="relative" style={{ height: `${tasks.length * ROW_HEIGHT_PX}px` }}>
                 {/* Grid Lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: timeScale === 'Year' ? getGridTemplate(secondaryHeader, 'Year') : `repeat(${totalUnits}, ${cellWidth}px)` }}>
                  { (timeScale === 'Year' ? secondaryHeader : secondaryHeaderDates).map((_, i) => {
                     let isWeekend = false;
                      if ((timeScale === 'Day' || timeScale === 'Month' || timeScale === 'Week') && secondaryHeaderDates[i]) {
                        const day = secondaryHeaderDates[i];
                        if (day) {
                          isWeekend = isSaturday(day) || isSunday(day);
                        }
                      }
                    return (
                      <div key={i} className={cn(
                          'border-r border-border/30 h-full',
                          isWeekend && 'bg-muted/60'
                      )}></div>
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
                     <marker id="arrowhead-critical" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                      <polygon points="0 0, 8 3, 0 6" className="fill-accent" />
                    </marker>
                  </defs>
                  {tasks.map((task) => 
                    task.dependencies.map(depId => {
                      const fromNode = nodeMap.get(depId);
                      const toNode = nodeMap.get(task.id);
                      if (!fromNode || !toNode) return null;

                      const isCritical = fromNode.isCritical && toNode.isCritical;
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
                          stroke={isCritical ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.5)"}
                          strokeWidth="1.5"
                          fill="none"
                          markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
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
                            <Diamond className={cn("h-6 w-6", task.isCritical ? "text-accent fill-accent" : "text-foreground fill-foreground" )} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{task.title}</p>
                          <p className="text-muted-foreground">{format(parseISO(task.startDate), 'd MMM yyyy')}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  const isDraggable = task.type === 'Activity' && !isMilestone;

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
                              onMouseDown={(e) => isDraggable && handleDragStart(e, task, 'move')}
                              className={cn(
                                "relative h-full w-full flex items-center rounded-sm text-primary-foreground overflow-hidden shadow-sm",
                                isDraggable && "cursor-grab",
                                draggingInfo?.task.id === task.id && "cursor-grabbing ring-2 ring-primary ring-offset-2 z-20",
                              )}
                            >
                             <div 
                                className="absolute inset-0"
                                style={{
                                  background: task.isCritical 
                                    ? `linear-gradient(to right, hsl(var(--accent)/0.8), hsl(var(--accent)/0.7) ${progress}%, hsl(var(--accent)/0.25) ${progress}%)`
                                    : (isSummary 
                                      ? `linear-gradient(to right, hsl(var(--foreground)/0.8), hsl(var(--foreground)/0.7) ${progress}%, hsl(var(--foreground)/0.25) ${progress}%)`
                                      : `linear-gradient(to right, hsl(var(--primary)/0.8), hsl(var(--primary)/0.7) ${progress}%, hsl(var(--primary)/0.25) ${progress}%)`)
                                }}
                              />
                              
                              {/* Drag Handles */}
                              {isDraggable && (
                                <>
                                  <div 
                                    onMouseDown={(e) => handleDragStart(e, task, 'resize-end')}
                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-10"
                                  />
                                </>
                              )}

                              <div className="relative flex items-center w-full px-2">
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
                                  <div className={cn("absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent", task.isCritical ? "border-r-[8px] border-r-accent" : "border-r-[8px] border-r-foreground")}></div>
                                  <div className={cn("absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent", task.isCritical ? "border-l-[8px] border-l-accent" : "border-l-[8px] border-l-foreground")}></div>
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
