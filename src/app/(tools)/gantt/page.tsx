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
  isSaturday,
  isSunday,
  addMonths,
  subMonths,
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
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [timeScale, setTimeScale] = useState<TimeScale>("Month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cellWidth, setCellWidth] = useState(120);

  useEffect(() => {
    switch (timeScale) {
      case "Day":
        setCellWidth(40);
        break;
      case "Week":
        setCellWidth(15); // 15px per day, 105px per week
        break;
      case "Month":
        setCellWidth(120);
        break;
      case "Year":
        setCellWidth(500);
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
    let interval;
    let primaryHeader: HeaderGroup[] = [];
    let secondaryHeader: HeaderGroup[] = [];
    let secondaryHeaderDates: Date[] = [];
    let totalUnits = 0;

    const projectStart = new Date(Math.min(...tasks.map(t => parseISO(t.startDate).getTime())));
    const projectEnd = new Date(Math.max(...tasks.map(t => parseISO(t.endDate).getTime())));

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
        interval = { start: intervalStart, end: intervalEnd };
        
        const weekOptions = { weekStartsOn: 1 as const };
        const start = startOfWeek(interval.start, weekOptions);
        const end = endOfWeek(interval.end, weekOptions);

        secondaryHeaderDates = eachDayOfInterval({ start, end });
        totalUnits = differenceInDays(end, start) + 1;

        const weeksInInterval = eachWeekOfInterval({start, end}, weekOptions);

        const yearsInInterval = eachYearOfInterval({ start, end });
        
        primaryHeader = yearsInInterval.map(yearStart => {
            const yearEnd = endOfYear(yearStart);
            const firstDay = yearStart > start ? yearStart : start;
            const lastDay = yearEnd < end ? yearEnd : end;
            const weeksInYear = differenceInWeeks(lastDay, firstDay, weekOptions) +1;
            return { label: format(yearStart, 'yyyy'), units: weeksInYear };
        }).filter(group => group.units > 0);
        
        secondaryHeader = weeksInInterval.map(week => ({ 
            label: `W${format(week, 'w')}`, units: 7
        }));
        break;
      }
      case "Month": {
        const currentMonthStart = startOfMonth(currentDate);
        interval = { start: subMonths(currentMonthStart, 1), end: endOfMonth(addMonths(currentMonthStart, 1)) };
        secondaryHeaderDates = eachMonthOfInterval(interval);
        totalUnits = 3;
        
        const year = format(currentDate, 'yyyy');
        const startYear = format(interval.start, 'yyyy');
        const endYear = format(interval.end, 'yyyy');
        
        if (startYear === endYear) {
            primaryHeader = [{ label: year, units: 3 }];
        } else {
            const monthsInStartYear = 12 - interval.start.getMonth();
            const monthsInEndYear = interval.end.getMonth() + 1;
            primaryHeader = [
                { label: startYear, units: monthsInStartYear },
                { label: endYear, units: monthsInEndYear }
            ].filter(y => y.units > 0);
        }

        secondaryHeader = secondaryHeaderDates.map(month => ({ label: format(month, 'MMM'), units: 1 }));
        break;
      }
      case "Year": {
        const startYear = startOfYear(projectStart);
        const endYear = endOfYear(projectEnd);
        interval = { start: startYear, end: endYear };
        secondaryHeaderDates = Array.from({ length: differenceInYears(endYear, startYear) + 1 }, (_, i) => addYears(startYear, i));
        totalUnits = secondaryHeaderDates.length;
        primaryHeader = [{ label: 'Years', units: totalUnits }];
        secondaryHeader = secondaryHeaderDates.map(year => ({ label: format(year, 'yyyy'), units: 1 }));
        break;
      }
    }
    
    let effectiveCellWidth = cellWidth;
    let effectiveTotalUnits = totalUnits;
    if (timeScale === 'Week') {
        effectiveCellWidth = cellWidth;
        effectiveTotalUnits = totalUnits;
    }


    return {
      interval,
      primaryHeader,
      secondaryHeader,
      secondaryHeaderDates,
      totalUnits: effectiveTotalUnits,
      timelineWidth: effectiveTotalUnits * effectiveCellWidth,
    };
  }, [timeScale, currentDate, cellWidth]);
  
  const getTaskPosition = useCallback((taskStartDateStr: string, taskEndDateStr: string) => {
    const taskStartDate = parseISO(taskStartDateStr);
    const taskEndDate = parseISO(taskEndDateStr);

    let startOffset = 0;
    let duration = 0;

    if (!interval.start || !interval.end) return { left: 0, width: 0};

    const weekOptions = { weekStartsOn: 1 as const };

    switch (timeScale) {
        case "Day":
        case "Week":
        {
            const intervalStart = timeScale === 'Week' ? startOfWeek(interval.start, weekOptions) : interval.start;
            startOffset = differenceInDays(taskStartDate, intervalStart);
            duration = differenceInDays(taskEndDate, taskStartDate) + 1;
            const left = startOffset * cellWidth;
            const width = duration * cellWidth;
            return { left, width };
        }
        case "Month": {
            const monthStart = interval.start;
            const startOffsetInDays = differenceInDays(taskStartDate, monthStart);
            const totalDaysInInterval = differenceInDays(interval.end, monthStart);
            startOffset = (startOffsetInDays / totalDaysInInterval) * totalUnits;
            
            const durationInDays = differenceInDays(taskEndDate, taskStartDate) + 1;
            duration = (durationInDays / totalDaysInInterval) * totalUnits;
            const left = startOffset * cellWidth;
            const width = duration * cellWidth;
            return { left, width };
        }
        case "Year": {
            startOffset = differenceInYears(taskStartDate, interval.start);
            duration = Math.max(1, differenceInYears(taskEndDate, taskStartDate) + 1);
            const left = startOffset * cellWidth;
            const width = duration * cellWidth;
            return { left, width };
        }
    }
    return {left: 0, width: 0};
  }, [timeScale, interval, cellWidth, totalUnits]);


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
  if (interval.start && interval.end) {
      const today = new Date();
      if (today >= interval.start && today <= interval.end) {
          if (timeScale === 'Day' || timeScale === 'Week') {
              const intervalStart = timeScale === 'Week' ? startOfWeek(interval.start, { weekStartsOn: 1 }) : interval.start;
              const todayOffset = differenceInDays(today, intervalStart);
              if (todayOffset >= 0) {
                 todayPositionX = todayOffset * cellWidth;
              }
          }
      }
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
                    min={timeScale === 'Day' ? 30 : (timeScale === 'Week' ? 10 : 50)}
                    max={timeScale === 'Day' ? 150 : (timeScale === 'Week' ? 50 : (timeScale === 'Month' ? 400 : 800))}
                    step={timeScale === 'Week' ? 5 : 10}
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
                <TableRow className="h-14 hover:bg-transparent border-b">
                  <TableHead className="w-auto font-bold">Task</TableHead>
                  <TableHead className="w-[100px] font-bold">Start</TableHead>
                  <TableHead className="w-[100px] font-bold">End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} style={{ height: `${ROW_HEIGHT_PX}px` }} className="border-b border-border/50 hover:bg-muted/50">
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
              <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm">
                <div className="grid border-b border-border/50" style={{ gridTemplateColumns: primaryHeader.map(g => `${g.units * (timeScale === 'Week' ? 7 : 1) * cellWidth}px`).join(' ') }}>
                  {primaryHeader.map((group, i) => (
                    <div key={i} className="h-7 flex items-center justify-center border-r border-border/50">
                      <span className="font-semibold text-sm">{group.label}</span>
                    </div>
                  ))}
                </div>
                <div className="grid" style={{ gridTemplateColumns: secondaryHeader.map(g => `${g.units * cellWidth}px`).join(' ') }}>
                  {secondaryHeader.map((group, i) => {
                    const isWeekend = timeScale === 'Day' && (isSaturday(secondaryHeaderDates[i]) || isSunday(secondaryHeaderDates[i]));
                    return (
                      <div key={i} className={`h-7 flex items-center justify-center border-r border-b border-border/50 ${isWeekend ? 'bg-muted/60' : ''}`}>
                        <span className="font-medium text-xs">{group.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Timeline Content */}
              <div className="relative" style={{ height: `${tasks.length * ROW_HEIGHT_PX}px` }}>
                 {/* Grid Lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: timeScale === 'Week' ? secondaryHeader.map(g => `${g.units * cellWidth}px`).join(' ') : `repeat(${totalUnits}, ${cellWidth}px)` }}>
                  {Array.from({ length: timeScale === 'Week' ? secondaryHeader.length : totalUnits }).map((_, i) => {
                     let isWeekend = false;
                      if (timeScale === 'Day' && secondaryHeaderDates[i]) {
                        isWeekend = isSaturday(secondaryHeaderDates[i]) || isSunday(secondaryHeaderDates[i]);
                      }
                      if (timeScale === 'Week' && secondaryHeaderDates[i * 7]) {
                        // For week view we don't highlight individual cells
                      }
                    return (
                      <div key={i} className={`border-r border-border/30 h-full ${isWeekend ? 'bg-muted/60' : ''}`}></div>
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
                      className="absolute group flex items-center"
                      style={{ 
                        top: `${index * ROW_HEIGHT_PX}px`,
                        left: `${left}px`, 
                        width: `${width}px`,
                        height: `${ROW_HEIGHT_PX}px`,
                        padding: '12px 0'
                      }}
                    >
                      <div
                        className="relative h-full w-full flex items-center rounded-sm text-primary-foreground overflow-hidden shadow-sm"
                        style={{
                          backgroundImage: `linear-gradient(to right, hsl(var(--primary)/0.8), hsl(var(--primary)/0.7) ${progress}%, hsl(var(--primary)/0.25) ${progress}%)`
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
