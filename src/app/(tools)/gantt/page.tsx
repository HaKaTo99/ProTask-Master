"use client";

import { teamMembers as initialTeamMembers } from "@/lib/data";
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
  isValid,
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
import type { Task, TeamMember } from "@/lib/types";
import { ChevronRight, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";


const initialTasks: Task[] = [
  { id: 'eps-1', title: 'Proyek Unggulan 2025', description: 'Proyek utama untuk tahun 2025.', status: 'To Do', priority: 'Urgent', startDate: '2025-01-01T00:00:00.000Z', endDate: '2025-12-31T00:00:00.000Z', dependencies: [], type: 'EPS' },
  { id: 'wbs-1.1', parentId: 'eps-1', title: '1.0 Perencanaan & Desain', description: 'Fase awal untuk riset, perencanaan, dan desain arsitektur.', status: 'To Do', priority: 'High', startDate: '2025-01-01T00:00:00.000Z', endDate: '2025-02-28T00:00:00.000Z', dependencies: [], type: 'WBS' },
  { id: 'act-1.1.1', parentId: 'wbs-1.1', title: '1.1 Riset Pasar & Analisis Kebutuhan', description: 'Menganalisis target pasar dan kebutuhan pengguna.', status: 'To Do', priority: 'High', assigneeId: 'user-3', startDate: '2025-01-01T00:00:00.000Z', endDate: '2025-01-31T00:00:00.000Z', dependencies: [], type: 'Activity' },
  { id: 'act-1.1.2', parentId: 'wbs-1.1', title: '1.2 Desain Arsitektur Sistem', description: 'Merancang arsitektur teknis dan model data.', status: 'To Do', priority: 'High', assigneeId: 'user-5', startDate: '2025-02-01T00:00:00.000Z', endDate: '2025-02-28T00:00:00.000Z', dependencies: ['act-1.1.1'], type: 'Activity' },
  { id: 'milestone-1.1.3', parentId: 'wbs-1.1', title: 'Persetujuan Desain Arsitektur', description: 'Persetujuan akhir untuk desain arsitektur.', status: 'To Do', priority: 'Urgent', startDate: '2025-02-28T00:00:00.000Z', endDate: '2025-02-28T00:00:00.000Z', dependencies: ['act-1.1.2'], type: 'Activity' },
  { id: 'wbs-1.2', parentId: 'eps-1', title: '2.0 Pengembangan Inti', description: 'Pengembangan backend dan infrastruktur dasar.', status: 'To Do', priority: 'High', startDate: '2025-03-01T00:00:00.000Z', endDate: '2025-06-30T00:00:00.000Z', dependencies: ['milestone-1.1.3'], type: 'WBS' },
  { id: 'act-1.2.1', parentId: 'wbs-1.2', title: '2.1 Pengaturan Lingkungan Pengembangan', description: 'Menyiapkan repositori, CI/CD, dan cloud environment.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-03-01T00:00:00.000Z', endDate: '2025-03-15T00:00:00.000Z', dependencies: ['milestone-1.1.3'], type: 'Activity' },
  { id: 'act-1.2.2', parentId: 'wbs-1.2', title: '2.2 Pengembangan API Backend', description: 'Membangun endpoint API utama untuk aplikasi.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-5', startDate: '2025-03-16T00:00:00.000Z', endDate: '2025-05-31T00:00:00.000Z', dependencies: ['act-1.2.1'], type: 'Activity' },
  { id: 'act-1.2.3', parentId: 'wbs-1.2', title: '2.3 Implementasi Skema Database', description: 'Menerapkan model data ke dalam database.', status: 'To Do', priority: 'High', assigneeId: 'user-2', startDate: '2025-03-16T00:00:00.000Z', endDate: '2025-04-30T00:00:00.000Z', dependencies: ['act-1.2.1'], type: 'Activity' },
  { id: 'wbs-1.3', parentId: 'eps-1', title: '3.0 Implementasi & Pengujian Fitur', description: 'Pengembangan frontend, integrasi, dan pengujian fitur.', status: 'To Do', priority: 'High', startDate: '2025-07-01T00:00:00.000Z', endDate: '2025-10-31T00:00:00.000Z', dependencies: ['act-1.2.2', 'act-1.2.3'], type: 'WBS' },
  { id: 'act-1.3.1', parentId: 'wbs-1.3', title: '3.1 Pengembangan UI/UX Frontend', description: 'Membangun antarmuka pengguna sesuai dengan desain.', status: 'To Do', priority: 'High', assigneeId: 'user-1', startDate: '2025-07-01T00:00:00.000Z', endDate: '2025-08-31T00:00:00.000Z', dependencies: ['act-1.2.2'], type: 'Activity' },
  { id: 'act-1.3.2', parentId: 'wbs-1.3', title: '3.2 Pengujian Integrasi', description: 'Menguji integrasi antara frontend dan backend.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-09-01T00:00:00.000Z', endDate: '2025-09-30T00:00:00.000Z', dependencies: ['act-1.3.1'], type: 'Activity' },
  { id: 'act-1.3.3', parentId: 'wbs-1.3', title: '3.3 Pengujian Penerimaan Pengguna (UAT)', description: 'Melibatkan pengguna akhir untuk pengujian beta.', status: 'To Do', priority: 'Medium', assigneeId: 'user-3', startDate: '2025-10-01T00:00:00.000Z', endDate: '2025-10-31T00:00:00.000Z', dependencies: ['act-1.3.2'], type: 'Activity' },
  { id: 'wbs-1.4', parentId: 'eps-1', title: '4.0 Peluncuran & Pasca-Peluncuran', description: 'Persiapan peluncuran, rilis, dan dukungan awal.', status: 'To Do', priority: 'Urgent', startDate: '2025-11-01T00:00:00.000Z', endDate: '2025-12-31T00:00:00.000Z', dependencies: ['act-1.3.3'], type: 'WBS' },
  { id: 'act-1.4.1', parentId: 'wbs-1.4', title: '4.1 Persiapan Infrastruktur Produksi', description: 'Menyiapkan server produksi dan melakukan hardening.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-5', startDate: '2025-11-01T00:00:00.000Z', endDate: '2025-11-30T00:00:00.000Z', dependencies: ['act-1.3.3'], type: 'Activity' },
  { id: 'milestone-1.4.2', parentId: 'wbs-1.4', title: 'Peluncuran Produk', description: 'Rilis resmi produk ke publik.', status: 'To Do', priority: 'Urgent', startDate: '2025-12-15T00:00:00.000Z', endDate: '2025-12-15T00:00:00.000Z', dependencies: ['act-1.4.1'], type: 'Activity' },
  { id: 'act-1.4.3', parentId: 'wbs-1.4', title: '4.2 Dukungan Pasca-Peluncuran & Pemantauan', description: 'Memberikan dukungan dan memantau kinerja sistem.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-12-16T00:00:00.000Z', endDate: '2025-12-31T00:00:00.000Z', dependencies: ['milestone-1.4.2'], type: 'Activity' },
];


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

// Enhanced component for inline editing
const EditableCell = ({ 
  value, 
  onSave,
  type = 'text' 
}: { 
  value: string; 
  onSave: (newValue: string) => void;
  type?: 'text' | 'date';
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    if (type === 'date') {
      // For date, format to YYYY-MM-DD for the input
      setCurrentValue(format(parseISO(value), 'yyyy-MM-dd'));
    } else {
      setCurrentValue(value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // For date, convert back to ISO string before saving
    if (type === 'date' && isValid(parseISO(currentValue))) {
      onSave(parseISO(currentValue).toISOString());
    } else if (type === 'text') {
      onSave(currentValue);
    } else {
      // Revert if date is invalid
      setCurrentValue(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur to save
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(value); // Revert changes
    }
  };

  if (isEditing) {
    return (
      <Input
        type={type}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="h-8 p-1 -m-1"
      />
    );
  }

  const displayValue = type === 'date' ? format(parseISO(value), 'd MMM yy') : value;

  return <div onDoubleClick={handleDoubleClick} className="truncate cursor-pointer">{displayValue}</div>;
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
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  
  const [draggingInfo, setDraggingInfo] = useState<{
    task: Task;
    action: 'move' | 'resize-end' | 'resize-start';
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
  
  const handleUpdateTaskDate = (taskId: string, field: 'startDate' | 'endDate', newDate: string) => {
    setAllTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, [field]: newDate };
          // Ensure end date is not before start date
          if (field === 'startDate' && parseISO(newDate) > parseISO(updatedTask.endDate)) {
            updatedTask.endDate = newDate;
          }
          if (field === 'endDate' && parseISO(newDate) < parseISO(updatedTask.startDate)) {
            updatedTask.startDate = newDate;
          }
          return updatedTask;
        }
        return task;
      })
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
  
  const tasksWithAssignees = useMemo(() => {
    const memberMap = new Map(teamMembers.map(m => [m.id, m]));
    return allTasks.map(task => ({
      ...task,
      assignee: task.assigneeId ? memberMap.get(task.assigneeId) : undefined
    }));
  }, [allTasks, teamMembers]);


  const processedTasks = useMemo(() => {
    const taskMap = new Map(tasksWithAssignees.map(t => [t.id, t]));

    function calculateDates(taskId: string) {
      const task = taskMap.get(taskId);
      if (!task) return;

      const parent = task.parentId ? taskMap.get(task.parentId) : null;
      if (parent && (parent.type === 'WBS' || parent.type === 'EPS')) {
          const children = tasksWithAssignees.filter(t => t.parentId === parent.id);
          if (children.length > 0) {
            const startDates = children.map(c => parseISO(c.startDate));
            const endDates = children.map(c => parseISO(c.endDate));
            parent.startDate = new Date(Math.min(...startDates.map(d => d.getTime()))).toISOString();
            parent.endDate = new Date(Math.max(...endDates.map(d => d.getTime()))).toISOString();
            
            // Recalculate parent's parent
            if (parent.parentId) {
              calculateDates(parent.parentId);
            }
          }
      }
    }
    
    tasksWithAssignees.forEach(task => {
        if (task.type === 'Activity') {
            calculateDates(task.id);
        }
    });

    function calculateCriticalPath(tasks: Task[]): Task[] {
        const taskMap = new Map(tasks.map(task => [task.id, { ...task }]));
        const taskCalculations = new Map<string, { es: number; ef: number; ls: number; lf: number; slack: number; duration: number }>();
        const validTasks = tasks.filter(t => isValid(parseISO(t.startDate)) && isValid(parseISO(t.endDate)));

        if (validTasks.length === 0) return tasks;

        validTasks.forEach(task => {
            const duration = differenceInDays(parseISO(task.endDate), parseISO(task.startDate)) || 1;
            taskCalculations.set(task.id, { es: 0, ef: 0, ls: Infinity, lf: Infinity, slack: 0, duration });
        });

        const projectStartDate = new Date(Math.min(...validTasks.map(t => parseISO(t.startDate).getTime())));
        
        validTasks.forEach(task => {
            const calc = taskCalculations.get(task.id)!;
            if (task.dependencies.length === 0) {
                calc.es = differenceInDays(parseISO(task.startDate), projectStartDate);
            } else {
                const maxEF = Math.max(...task.dependencies.map(depId => taskCalculations.get(depId)?.ef || 0));
                calc.es = maxEF;
            }
            calc.ef = calc.es + calc.duration;
        });

        const projectEndDateVal = Math.max(...Array.from(taskCalculations.values()).map(c => c.ef));
        
        const reversedTasks = [...validTasks].reverse();
        reversedTasks.forEach(task => {
            const calc = taskCalculations.get(task.id)!;
            const successors = validTasks.filter(t => t.dependencies.includes(task.id));

            if (successors.length === 0) {
                calc.lf = projectEndDateVal;
            } else {
                const minLS = Math.min(...successors.map(s => taskCalculations.get(s.id)?.ls || Infinity));
                calc.lf = minLS;
            }
            calc.ls = calc.lf - calc.duration;
            calc.slack = calc.ls - calc.es;
        });
        
        const criticalPathTasks = new Set<string>();
        taskCalculations.forEach((calc, taskId) => {
            if (calc.slack <= 1) { // Allow for small rounding errors
                criticalPathTasks.add(taskId);
            }
        });

        return tasks.map(task => ({
            ...task,
            isCritical: criticalPathTasks.has(task.id),
        }));
    }
    
    const tasksWithCriticalPath = calculateCriticalPath(Array.from(taskMap.values()));

    const sortedTasks: Task[] = [];
    const visited = new Set<string>();
    const finalTaskMap = new Map(tasksWithCriticalPath.map(task => [task.id, task]));

    function visit(taskId: string) {
        if (visited.has(taskId) || !finalTaskMap.has(taskId)) return;
        visited.add(taskId);
        
        const task = finalTaskMap.get(taskId);
        if (!task) return;

        sortedTasks.push(task);

        const children = tasksWithCriticalPath
          .filter(t => t.parentId === taskId)
          .sort((a, b) => a.id.localeCompare(b.id));

        children.forEach(child => visit(child.id));
    }

    const rootNodes = tasksWithCriticalPath.filter(task => !task.parentId).sort((a,b) => a.id.localeCompare(b.id));
    rootNodes.forEach(root => visit(root.id));

    return sortedTasks;
  }, [tasksWithAssignees]);


  const tasks = useMemo(() => {
    const visibleTasks: Task[] = [];
    const taskMap = new Map(processedTasks.map(t => [t.id, t]));

    for (const task of processedTasks) {
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
  }, [collapsed, processedTasks]);


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
        setCellWidth(40);
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
        totalUnits = secondaryHeaderDates.length;
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
        
        const yearsInInterval = eachYearOfInterval(interval);
        primaryHeader = yearsInInterval.map(yearStart => ({
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

    const finalTimelineWidth = secondaryHeader.reduce((acc, h) => acc + (h.units * cellWidth), 0);

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
    if (!taskStartDateStr || !taskEndDateStr) return { left: 0, width: 0};
    const taskStartDate = parseISO(taskStartDateStr);
    const taskEndDate = parseISO(taskEndDateStr);
    
    if (!isValid(taskStartDate) || !isValid(taskEndDate) || !interval.start || !interval.end) {
      return { left: 0, width: 0};
    }

    switch (timeScale) {
        case "Day":
        case "Week":
        case "Month":
        {
            const startOffset = Math.max(0, differenceInDays(taskStartDate, interval.start));
            const duration = Math.max(1, differenceInDays(taskEndDate, taskStartDate) + 1);
            const left = startOffset * cellWidth;
            const width = duration * cellWidth;
            return { left, width };
        }
        case "Year": {
            const startOffset = Math.max(0, differenceInMonths(taskStartDate, interval.start));
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
  
  const handleDragStart = (e: React.MouseEvent, task: Task, action: 'move' | 'resize-end' | 'resize-start') => {
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
    let unitsMoved = 0;
    
    unitsMoved = Math.round(dx / cellWidth);
    
    let newStartDate = draggingInfo.initialStartDate;
    let newEndDate = draggingInfo.initialEndDate;
    let duration = differenceInDays(draggingInfo.initialEndDate, draggingInfo.initialStartDate);

    if (timeScale === 'Year') {
      if (draggingInfo.action === 'move') {
          newStartDate = addMonths(draggingInfo.initialStartDate, unitsMoved);
          newEndDate = addMonths(draggingInfo.initialEndDate, unitsMoved);
      } else if (draggingInfo.action === 'resize-end') {
          newEndDate = addMonths(draggingInfo.initialEndDate, unitsMoved);
          if (newEndDate < newStartDate) newEndDate = newStartDate;
      } else if (draggingInfo.action === 'resize-start') {
          newStartDate = addMonths(draggingInfo.initialStartDate, unitsMoved);
          if (newStartDate > newEndDate) newStartDate = newEndDate;
      }
    } else {
        if (draggingInfo.action === 'move') {
            newStartDate = addDays(draggingInfo.initialStartDate, unitsMoved);
            newEndDate = addDays(newStartDate, duration);
        } else if (draggingInfo.action === 'resize-end') {
            newEndDate = addDays(draggingInfo.initialEndDate, unitsMoved);
            if (newEndDate < newStartDate) newEndDate = newStartDate;
        } else if (draggingInfo.action === 'resize-start') {
            newStartDate = addDays(draggingInfo.initialStartDate, unitsMoved);
            if (newStartDate > newEndDate) newStartDate = newEndDate;
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

 const getGridTemplate = (headerGroups: HeaderGroup[], cellWidth: number) => {
    return headerGroups.map(g => `${g.units * cellWidth}px`).join(' ');
  }


  const getTaskLevel = (task: Task) => {
    if (!task.parentId) return 0;
    const parent = processedTasks.find(t => t.id === task.parentId);
    if (!parent) return 1;
    return getTaskLevel(parent) + 1;
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
                    max={timeScale === 'Year' ? 200 : (timeScale === 'Month' ? 80 : 80)}
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
                      <div className="flex items-center gap-1" style={{ paddingLeft: `${getTaskLevel(task) * 16}px` }}>
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
                    <TableCell className="text-muted-foreground">
                      <EditableCell
                        type="date"
                        value={task.startDate}
                        onSave={(newDate) => handleUpdateTaskDate(task.id, 'startDate', newDate)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                       <EditableCell
                        type="date"
                        value={task.endDate}
                        onSave={(newDate) => handleUpdateTaskDate(task.id, 'endDate', newDate)}
                      />
                    </TableCell>
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
                <div className="grid border-b border-border/50" style={{ gridTemplateColumns: getGridTemplate(primaryHeader, cellWidth) }}>
                  {primaryHeader.map((group, i) => (
                    <div key={i} className="h-7 flex items-center justify-center border-r border-border/50">
                      <span className="font-semibold text-sm">{group.label}</span>
                    </div>
                  ))}
                </div>
                 <div className="grid" style={{ gridTemplateColumns: getGridTemplate(secondaryHeader, cellWidth) }}>
                  {secondaryHeader.map((group, i) => {
                     let isWeekend = false;
                     if((timeScale === 'Day' || timeScale === 'Week') && secondaryHeaderDates[i]) {
                         const day = secondaryHeaderDates[i];
                         isWeekend = isSaturday(day) || isSunday(day);
                     } else if (timeScale === 'Month') {
                        const day = secondaryHeaderDates[i];
                        if (day) isWeekend = isSaturday(day) || isSunday(day);
                     }
                    
                    return (
                      <div key={i} className={cn(
                        "h-7 flex items-center justify-center border-r border-b border-border/50",
                         isWeekend && 'bg-muted/60'
                      )}>
                        <span className="font-medium text-xs">{group.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Timeline Content */}
              <div className="relative" style={{ height: `${tasks.length * ROW_HEIGHT_PX}px` }}>
                 {/* Grid Lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: getGridTemplate(secondaryHeader, cellWidth) }}>
                  { secondaryHeader.map((_, i) => {
                     let isWeekend = false;
                      if ((timeScale === 'Day' || timeScale === 'Week' || timeScale === 'Month') && secondaryHeaderDates[i]) {
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
                                "relative h-full w-full flex items-center rounded-sm text-primary-foreground overflow-hidden shadow-sm z-10",
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
                                    onMouseDown={(e) => handleDragStart(e, task, 'resize-start')}
                                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-20"
                                  />
                                  <div 
                                    onMouseDown={(e) => handleDragStart(e, task, 'resize-end')}
                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-20"
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
                      
                       {/* Dependency handles */}
                      {isDraggable && (
                        <>
                          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-background cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-background cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                        </>
                      )}

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
