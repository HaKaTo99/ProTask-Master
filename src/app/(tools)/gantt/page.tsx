
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
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  differenceInMinutes,
  addMinutes,
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
import type { Task, TeamMember, Dependency } from "@/lib/types";
import { ChevronRight, Diamond, Layers, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { TaskEditorDialog } from "@/components/gantt/TaskEditorDialog";


const initialTasksData: Task[] = [
  // EPS
  { id: 'eps-amdal', title: 'Proyek AMDAL Pembangunan Pabrik', description: 'Studi Analisis Mengenai Dampak Lingkungan untuk rencana pembangunan pabrik.', status: 'To Do', priority: 'Urgent', startDate: '2025-07-01T00:00:00.000Z', endDate: '2025-12-20T00:00:00.000Z', dependencies: [], type: 'EPS' },

  // WBS 1: Persiapan dan Kerangka Acuan
  { id: 'wbs-1', parentId: 'eps-amdal', title: '1.0 Tahap Persiapan & Penyusunan Kerangka Acuan (KA)', description: 'Fase awal meliputi persiapan administrasi, tim, dan penyusunan dokumen KA.', status: 'To Do', priority: 'High', startDate: '2025-07-01T00:00:00.000Z', endDate: '2025-07-31T00:00:00.000Z', dependencies: [], type: 'WBS' },
  { id: 'act-1.1', parentId: 'wbs-1', title: '1.1 Kick-off Meeting dan Pembentukan Tim', description: 'Rapat awal dengan semua pemangku kepentingan dan pembentukan tim studi.', status: 'To Do', priority: 'High', assigneeId: 'user-3', startDate: '2025-07-01T09:00:00.000Z', endDate: '2025-07-03T17:00:00.000Z', dependencies: [], type: 'Activity' },
  { id: 'act-1.2', parentId: 'wbs-1', title: '1.2 Pengumpulan Data Sekunder & Studi Pustaka', description: 'Mengumpulkan data awal, peta, dan regulasi yang relevan.', status: 'To Do', priority: 'Medium', assigneeId: 'user-2', startDate: '2025-07-04T09:00:00.000Z', endDate: '2025-07-11T17:00:00.000Z', dependencies: [{ id: 'act-1.1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-1.3', parentId: 'wbs-1', title: '1.3 Penyusunan Draft Kerangka Acuan (KA)', description: 'Menyusun dokumen Kerangka Acuan untuk lingkup studi AMDAL.', status: 'To Do', priority: 'High', assigneeId: 'user-5', startDate: '2025-07-14T09:00:00.000Z', endDate: '2025-07-25T17:00:00.000Z', dependencies: [{ id: 'act-1.2', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'milestone-1', parentId: 'wbs-1', title: 'Persetujuan Kerangka Acuan (KA)', description: 'Mendapatkan persetujuan resmi atas dokumen KA dari komisi penilai.', status: 'To Do', priority: 'Urgent', startDate: '2025-07-31T17:00:00.000Z', endDate: '2025-07-31T17:00:00.000Z', dependencies: [{ id: 'act-1.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },

  // WBS 2: Pengumpulan Data Primer
  { id: 'wbs-2', parentId: 'eps-amdal', title: '2.0 Tahap Pengumpulan Data Primer', description: 'Survei dan pengambilan sampel di lokasi proyek.', status: 'To Do', priority: 'High', startDate: '2025-08-01T00:00:00.000Z', endDate: '2025-08-29T00:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'WBS' },
  { id: 'act-2.1', parentId: 'wbs-2', title: '2.1 Survei Komponen Geofisika-Kimia', description: 'Pengambilan sampel air, udara, dan tanah.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-08-01T09:00:00.000Z', endDate: '2025-08-15T17:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-2.2', parentId: 'wbs-2', title: '2.2 Survei Komponen Biologi', description: 'Inventarisasi flora dan fauna di sekitar lokasi proyek.', status: 'To Do', priority: 'High', assigneeId: 'user-1', startDate: '2025-08-04T09:00:00.000Z', endDate: '2025-08-18T17:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-2.3', parentId: 'wbs-2', title: '2.3 Survei Sosial, Ekonomi, dan Budaya', description: 'Wawancara dengan masyarakat dan pemangku kepentingan.', status: 'To Do', priority: 'High', assigneeId: 'user-3', startDate: '2025-08-11T09:00:00.000Z', endDate: '2025-08-29T17:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },

  // WBS 3: Analisis dan Evaluasi Dampak
  { id: 'wbs-3', parentId: 'eps-amdal', title: '3.0 Analisis Data & Evaluasi Dampak', description: 'Analisis data laboratorium dan evaluasi potensi dampak penting.', status: 'To Do', priority: 'High', startDate: '2025-09-01T00:00:00.000Z', endDate: '2025-10-17T00:00:00.000Z', dependencies: [{ id: 'act-2.1', type: 'Finish-to-Start', lag: 0 }, { id: 'act-2.2', type: 'Finish-to-Start', lag: 0 }, { id: 'act-2.3', type: 'Finish-to-Start', lag: 0 }], type: 'WBS' },
  { id: 'act-3.1', parentId: 'wbs-3', title: '3.1 Analisis Laboratorium Sampel', description: 'Analisis hasil sampel air, udara, dan tanah di laboratorium.', status: 'To Do', priority: 'High', assigneeId: 'user-2', startDate: '2025-09-01T09:00:00.000Z', endDate: '2025-09-19T17:00:00.000Z', dependencies: [{ id: 'act-2.1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-3.2', parentId: 'wbs-3', title: '3.2 Prakiraan & Evaluasi Dampak Penting', description: 'Menganalisis dan mengevaluasi besaran dan sifat dampak.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-5', startDate: '2025-09-22T09:00:00.000Z', endDate: '2025-10-10T17:00:00.000Z', dependencies: [{ id: 'act-3.1', type: 'Finish-to-Start', lag: 0 }, { id: 'act-2.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-3.3', parentId: 'wbs-3', title: '3.3 Evaluasi Holistik Dampak', description: 'Evaluasi dampak secara keseluruhan sebagai satu kesatuan.', status: 'To Do', priority: 'High', assigneeId: 'user-3', startDate: '2025-10-13T09:00:00.000Z', endDate: '2025-10-17T17:00:00.000Z', dependencies: [{ id: 'act-3.2', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  
  // WBS 4: Penyusunan Laporan dan Finalisasi
  { id: 'wbs-4', parentId: 'eps-amdal', title: '4.0 Penyusunan Laporan & Finalisasi', description: 'Menyusun dokumen ANDAL, RKL, dan RPL serta asistensi.', status: 'To Do', priority: 'Urgent', startDate: '2025-10-20T00:00:00.000Z', endDate: '2025-12-20T00:00:00.000Z', dependencies: [{ id: 'act-3.3', type: 'Finish-to-Start', lag: 0 }], type: 'WBS' },
  { id: 'act-4.1', parentId: 'wbs-4', title: '4.1 Penyusunan Draft Dokumen ANDAL', description: 'Menyusun laporan Analisis Dampak Lingkungan.', status: 'To Do', priority: 'High', assigneeId: 'user-5', startDate: '2025-10-20T09:00:00.000Z', endDate: '2025-11-14T17:00:00.000Z', dependencies: [{ id: 'act-3.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-4.2', parentId: 'wbs-4', title: '4.2 Penyusunan Draft RKL-RPL', description: 'Menyusun Rencana Pengelolaan dan Pemantauan Lingkungan.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-10-27T09:00:00.000Z', endDate: '2025-11-21T17:00:00.000Z', dependencies: [{ id: 'act-3.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-4.3', parentId: 'wbs-4', title: '4.3 Asistensi & Pembahasan Laporan', description: 'Pembahasan draft laporan dengan komisi penilai AMDAL.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-3', startDate: '2025-11-24T09:00:00.000Z', endDate: '2025-12-12T17:00:00.000Z', dependencies: [{ id: 'act-4.1', type: 'Finish-to-Start', lag: 0 }, { id: 'act-4.2', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'milestone-2', parentId: 'wbs-4', title: 'Penyerahan Laporan Final', description: 'Penyerahan dokumen final ANDAL dan RKL-RPL yang telah direvisi.', status: 'To Do', priority: 'Urgent', startDate: '2025-12-19T17:00:00.000Z', endDate: '2025-12-19T17:00:00.000Z', dependencies: [{ id: 'act-4.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
];

type Node = {
  id: string;
  startDate: Date;
  endDate: Date;
  y: number;
  isCritical?: boolean;
};

type TimeScale = "Hour" | "Day" | "Week" | "Month" | "Year";

const ROW_HEIGHT_PX = 60; // Increased height for baseline bar
const HEADER_HEIGHT_PX = 56;

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
      try {
        setCurrentValue(format(parseISO(value), 'yyyy-MM-dd'));
      } catch (e) {
        console.error("Invalid date value for editing:", value);
        setCurrentValue('');
      }
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
       if (type === 'date') {
        try {
          setCurrentValue(format(parseISO(value), 'yyyy-MM-dd'));
        } catch (e) {
            setCurrentValue('');
        }
       } else {
        setCurrentValue(value);
       }
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

  let displayValue = value;
  if (type === 'date') {
    try {
      displayValue = format(parseISO(value), 'd MMM yy');
    } catch (e) {
      displayValue = "Invalid Date";
    }
  }

  return <div onDoubleClick={handleDoubleClick} className="truncate cursor-pointer">{displayValue}</div>;
};


const GanttChart = () => {
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const [timeScale, setTimeScale] = useState<TimeScale>("Month");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [cellWidth, setCellWidth] = useState(120);
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasksData);
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [draggingInfo, setDraggingInfo] = useState<{
    task: Task;
    action: 'move' | 'resize-end' | 'resize-start';
    initialX: number;
    initialStartDate: Date;
    initialEndDate: Date;
  } | null>(null);

  const [newDependency, setNewDependency] = useState<{
    sourceTaskId: string;
    sourceHandle: 'start' | 'end';
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const handleUpdateTask = useCallback((taskId: string, updatedProperties: Partial<Task>) => {
      setAllTasks(prevTasks =>
          prevTasks.map(task =>
              task.id === taskId ? { ...task, ...updatedProperties } : task
          )
      );
  }, []);
  
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

  const handleCreateDependency = (sourceId: string, targetId: string) => {
    setAllTasks(prevTasks => {
        const sourceTask = prevTasks.find(t => t.id === sourceId);
        const targetTask = prevTasks.find(t => t.id === targetId);

        if (!sourceTask || !targetTask || targetId === sourceId || targetTask.dependencies.some(d => d.id === sourceId)) {
            return prevTasks;
        }

        const visited = new Set<string>();
        const stack = [sourceId];
        while (stack.length > 0) {
            const currentId = stack.pop()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            const currentTask = prevTasks.find(t => t.id === currentId);
            if (!currentTask) continue;
            
            if(currentTask.id === targetId) return prevTasks; // Circular dependency found

            for (const dep of currentTask.dependencies) {
                stack.push(dep.id);
            }
        }
        
        const newDependency: Dependency = { id: sourceId, type: 'Finish-to-Start', lag: 0 };
        return prevTasks.map(task => 
            task.id === targetId 
            ? { ...task, dependencies: [...task.dependencies, newDependency] }
            : task
        );
    });
}

  const setBaseline = () => {
    setAllTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        baselineStartDate: task.startDate,
        baselineEndDate: task.endDate,
      }))
    );
  };

  const handleUpdateDependencies = useCallback((taskId: string, newDependencies: Dependency[]) => {
    setAllTasks(prevTasks => {
      return prevTasks.map(task => 
        task.id === taskId 
        ? { ...task, dependencies: newDependencies }
        : task
      );
    });
  }, []);

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
            const startDates = children.map(c => parseISO(c.startDate)).filter(d => isValid(d));
            const endDates = children.map(c => parseISO(c.endDate)).filter(d => isValid(d));
            if (startDates.length > 0) {
                parent.startDate = new Date(Math.min(...startDates.map(d => d.getTime()))).toISOString();
            }
            if (endDates.length > 0) {
                parent.endDate = new Date(Math.max(...endDates.map(d => d.getTime()))).toISOString();
            }
            
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

        const projectStartDate = new Date(Math.min(...validTasks.map(t => parseISO(t.startDate).getTime())));
        
        validTasks.forEach(task => {
            const duration = differenceInDays(parseISO(task.endDate), parseISO(task.startDate)) || 1;
            taskCalculations.set(task.id, { es: 0, ef: 0, ls: Infinity, lf: Infinity, slack: 0, duration });
        });
        
        // Forward pass
        validTasks.forEach(task => {
            const calc = taskCalculations.get(task.id)!;
            if (task.dependencies.length === 0) {
                // If no dependencies, early start is its own start date relative to project start
                 calc.es = differenceInDays(parseISO(task.startDate), projectStartDate);
            } else {
                const maxEF = Math.max(...task.dependencies.map(dep => taskCalculations.get(dep.id)?.ef || 0));
                calc.es = maxEF;
            }
            calc.ef = calc.es + calc.duration;
        });

        const projectEndDateVal = Math.max(...Array.from(taskCalculations.values()).map(c => c.ef));
        
        // Backward pass
        const reversedTasks = [...validTasks].reverse();
        reversedTasks.forEach(task => {
            const calc = taskCalculations.get(task.id)!;
            const successors = validTasks.filter(t => t.dependencies.some(d => d.id === task.id));

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
            if (calc.slack <= 1) { // Allow for small rounding/float errors
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

    function visit(taskId: string, level: number = 0) {
        if (visited.has(taskId) || !finalTaskMap.has(taskId)) return;
        visited.add(taskId);
        
        const task = finalTaskMap.get(taskId);
        if (!task) return;
        
        (task as any).level = level;
        sortedTasks.push(task);

        const children = tasksWithCriticalPath
          .filter(t => t.parentId === taskId)
          .sort((a, b) => a.id.localeCompare(b.id));

        children.forEach(child => visit(child.id, level + 1));
    }

    const rootNodes = tasksWithCriticalPath.filter(task => !task.parentId).sort((a,b) => a.id.localeCompare(b.id));
    rootNodes.forEach(root => visit(root.id, 0));

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
      case "Hour":
        setCellWidth(50);
        break;
      case "Day":
        setCellWidth(60);
        break;
      case "Week":
        setCellWidth(80);
        break;
      case "Month":
        setCellWidth(120);
        break;
      case "Year":
        setCellWidth(150);
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

    const validTasks = allTasks.filter(t => isValid(parseISO(t.startDate)) && isValid(parseISO(t.endDate)));
    if (validTasks.length === 0) {
      interval = { start: startOfYear(new Date()), end: endOfYear(new Date()) };
    } else {
       const minDate = new Date(Math.min(...validTasks.map(t => parseISO(t.startDate).getTime())));
       const maxDate = new Date(Math.max(...validTasks.map(t => parseISO(t.endDate).getTime())));
       interval = { start: startOfYear(minDate), end: endOfYear(maxDate) };
    }


    switch (timeScale) {
      case "Hour": {
        interval = { start: startOfDay(currentDate), end: endOfDay(currentDate) };
        secondaryHeaderDates = eachHourOfInterval(interval);
        totalUnits = secondaryHeaderDates.length;
        primaryHeader = [{ label: format(currentDate, "eeee, d MMM"), units: 24 }];
        secondaryHeader = secondaryHeaderDates.map(hour => ({
          label: format(hour, 'HH:mm'),
          units: 1,
        }));
        break;
      }
      case "Day": {
        secondaryHeaderDates = eachDayOfInterval(interval);
        totalUnits = secondaryHeaderDates.length;
        const months = eachMonthOfInterval(interval);
        primaryHeader = months.map(monthStart => {
          const monthEnd = endOfMonth(monthStart);
          const end = interval.end < monthEnd ? interval.end : monthEnd;
          const daysInMonth = differenceInDays(end, monthStart) + 1;
          return { label: format(monthStart, "MMM ''yy"), units: daysInMonth };
        });
        secondaryHeader = secondaryHeaderDates.map(day => ({
          label: format(day, 'EEE d'),
          units: 1
        }));
        break;
      }
      case "Week": {
        interval = { start: startOfWeek(interval.start, { weekStartsOn: 1 }), end: endOfWeek(interval.end, { weekStartsOn: 1 }) };
        
        const weeksInInterval = eachWeekOfInterval(interval, { weekStartsOn: 1 });
        secondaryHeaderDates = weeksInInterval;
        totalUnits = weeksInInterval.length;
        secondaryHeader = weeksInInterval.map(weekStart => ({ label: `W${getISOWeek(weekStart)}`, units: 1 }));

        const monthsInInterval = eachMonthOfInterval({ start: interval.start, end: interval.end });
        primaryHeader = monthsInInterval.map(monthStart => {
            const start = new Date(Math.max(interval.start.getTime(), monthStart.getTime()));
            const end = new Date(Math.min(interval.end.getTime(), endOfMonth(monthStart).getTime()));
            const weeksInMonth = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).length;
            return { label: format(monthStart, "MMM ''yy"), units: weeksInMonth };
        });
        break;
      }
      case "Month": {
        secondaryHeaderDates = eachMonthOfInterval(interval);
        totalUnits = secondaryHeaderDates.length;
        secondaryHeader = secondaryHeaderDates.map(monthStart => ({
            label: format(monthStart, 'MMM'),
            units: 1
        }));
        
        const years = eachYearOfInterval(interval);
        primaryHeader = years.map(yearStart => {
          const yearEnd = endOfYear(yearStart);
          const start = new Date(Math.max(interval.start.getTime(), yearStart.getTime()));
          const end = new Date(Math.min(interval.end.getTime(), yearEnd.getTime()));
          const monthsInYear = differenceInMonths(end, start) + 1;
          return { label: format(yearStart, 'yyyy'), units: monthsInYear > 0 ? monthsInYear : 1 };
        });

        break;
      }
      case "Year": {
        const startYear = startOfYear(subYears(interval.start, 2));
        const endYear = endOfYear(addYears(interval.end, 2));
        interval = { start: startYear, end: endYear };

        secondaryHeaderDates = eachYearOfInterval(interval);
        totalUnits = secondaryHeaderDates.length;
        secondaryHeader = secondaryHeaderDates.map(year => ({ 
            label: format(year, 'yyyy'), 
            units: 1 
        }));
        primaryHeader = [{ label: `Decade ${format(interval.start, 'yy')} - ${format(interval.end, 'yy')}`, units: totalUnits }];
        break;
      }
    }

    const finalTimelineWidth = totalUnits * cellWidth;

    return {
      interval,
      primaryHeader,
      secondaryHeader,
      secondaryHeaderDates,
      totalUnits,
      timelineWidth: finalTimelineWidth,
    };
  }, [timeScale, currentDate, cellWidth, allTasks]);
  
  const getUnitWidth = useCallback(() => {
    return cellWidth;
  }, [cellWidth]);

  const getPositionFromDate = useCallback((date: Date) => {
      if (!isValid(date)) return 0;
      switch (timeScale) {
        case 'Hour': return differenceInMinutes(date, interval.start) / 60 * getUnitWidth();
        case 'Day': return differenceInDays(date, interval.start) * getUnitWidth();
        case 'Week': {
            const days = differenceInDays(date, interval.start);
            return (days / 7) * getUnitWidth();
        }
        case 'Month': {
          const fullMonths = differenceInMonths(date, interval.start);
          const monthStart = addMonths(interval.start, fullMonths);
          const daysInMonth = differenceInDays(endOfMonth(monthStart), startOfMonth(monthStart)) + 1;
          const remainingDays = differenceInDays(date, monthStart);
          return (fullMonths + remainingDays / daysInMonth) * getUnitWidth();
        }
        case 'Year': {
          const fullYears = differenceInMonths(date, interval.start) / 12;
          return fullYears * getUnitWidth();
        }
        default: return 0;
      }
  }, [timeScale, interval.start, getUnitWidth]);
  
  const getDateFromPosition = useCallback((x: number) => {
    switch (timeScale) {
      case 'Hour': return addMinutes(interval.start, (x / getUnitWidth()) * 60);
      case 'Day': return addDays(interval.start, x / getUnitWidth());
      case 'Week': return addDays(interval.start, (x / getUnitWidth()) * 7);
      case 'Month': {
        const totalMonths = x / getUnitWidth();
        const fullMonths = Math.floor(totalMonths);
        const partialMonth = totalMonths - fullMonths;
        const monthStart = addMonths(interval.start, fullMonths);
        const daysInMonth = differenceInDays(endOfMonth(monthStart), startOfMonth(monthStart)) + 1;
        const daysToAdd = Math.round(partialMonth * daysInMonth);
        return addDays(monthStart, daysToAdd);
      }
      case 'Year': return addMonths(interval.start, (x / getUnitWidth()) * 12);
      default: return interval.start;
    }
  }, [timeScale, interval.start, getUnitWidth]);
  
  const getTaskPosition = useCallback((taskStartDateStr: string, taskEndDateStr: string) => {
    if (!taskStartDateStr || !taskEndDateStr) return { left: 0, width: 0};
    const taskStartDate = parseISO(taskStartDateStr);
    const taskEndDate = parseISO(taskEndDateStr);
    
    if (!isValid(taskStartDate) || !isValid(taskEndDate) || !interval.start || !interval.end) {
      return { left: 0, width: 0};
    }

    const isMilestone = taskStartDateStr === taskEndDateStr;
    
    const left = getPositionFromDate(taskStartDate);
    
    const effectiveEndDate = isMilestone ? taskEndDate : addDays(taskEndDate, 1);
    const end = getPositionFromDate(effectiveEndDate);

    let width = end - left;

    if (isMilestone) {
        width = 0; // Milestones have no width, they are a point in time
    } else if (width < 2) {
        width = 2; // Ensure a minimum visual width
    }
    
    return { left, width };

  }, [getPositionFromDate, timeScale, interval]);


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
    if (task.type !== 'Activity') return;
    
    const isMilestone = task.startDate === task.endDate;
    if (isMilestone && action !== 'move') return;

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

  const handleDependencyDragStart = (e: React.MouseEvent, sourceTaskId: string, sourceHandle: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!ganttContainerRef.current) return;
    const rect = ganttContainerRef.current.getBoundingClientRect();
    const scrollLeft = ganttContainerRef.current.scrollLeft;
    const scrollTop = ganttContainerRef.current.scrollTop;
    
    const startX = e.clientX - rect.left + scrollLeft;
    const startY = e.clientY - rect.top + scrollTop;

    setNewDependency({
        sourceTaskId,
        sourceHandle,
        startX,
        startY,
        endX: startX,
        endY: startY,
    });
}


  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (draggingInfo) {
      const dx = e.clientX - draggingInfo.initialX;
      
      let finalStartDate: Date;
      let finalEndDate: Date;

      if (draggingInfo.action === 'move') {
          const startPos = getPositionFromDate(draggingInfo.initialStartDate);
          const newStartPos = startPos + dx;
          finalStartDate = getDateFromPosition(newStartPos);
          const duration = differenceInMinutes(draggingInfo.initialEndDate, draggingInfo.initialStartDate);
          finalEndDate = addMinutes(finalStartDate, duration);
      } else {
          finalStartDate = draggingInfo.initialStartDate;
          finalEndDate = draggingInfo.initialEndDate;
          if (draggingInfo.action === 'resize-end') {
              const endPos = getPositionFromDate(draggingInfo.initialEndDate);
              const newEndPos = endPos + dx;
              finalEndDate = getDateFromPosition(newEndPos);
              if (finalEndDate < finalStartDate) finalEndDate = finalStartDate;
          } else { // resize-start
              const startPos = getPositionFromDate(draggingInfo.initialStartDate);
              const newStartPos = startPos + dx;
              finalStartDate = getDateFromPosition(newStartPos);
              if (finalStartDate > finalEndDate) finalStartDate = finalEndDate;
          }
      }

      setAllTasks(prevTasks => prevTasks.map(t => {
        if (t.id === draggingInfo.task.id) {
          return {
            ...t,
            startDate: finalStartDate.toISOString(),
            endDate: finalEndDate.toISOString(),
          };
        }
        return t;
      }));
    } else if (newDependency && ganttContainerRef.current) {
        const rect = ganttContainerRef.current.getBoundingClientRect();
        const endX = e.clientX - rect.left + ganttContainerRef.current.scrollLeft;
        const endY = e.clientY - rect.top + ganttContainerRef.current.scrollTop;
        setNewDependency(prev => prev ? { ...prev, endX, endY } : null);
    }
  }, [draggingInfo, getPositionFromDate, getDateFromPosition, newDependency]);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
    if (draggingInfo) {
      setDraggingInfo(null);
    }
    if (newDependency) {
      const targetElement = e.target as HTMLElement;
      const targetTaskElement = targetElement.closest('[data-task-id][data-handle-type]');
      if (targetTaskElement) {
        const targetTaskId = targetTaskElement.getAttribute('data-task-id');
        if (targetTaskId && newDependency.sourceTaskId !== targetTaskId) {
            handleCreateDependency(newDependency.sourceTaskId, targetTaskId);
        }
      }
      setNewDependency(null);
    }
  }, [draggingInfo, newDependency, handleCreateDependency]);
  
  useEffect(() => {
    const isDragging = !!draggingInfo || !!newDependency;
    
    if (isDragging) {
      document.body.style.cursor = draggingInfo ? (draggingInfo.action === 'move' ? 'grabbing' : 'ew-resize') : 'crosshair';
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [draggingInfo, newDependency, handleGlobalMouseMove, handleGlobalMouseUp]);
  
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
        todayPositionX = getPositionFromDate(today);
      }
  }

 const getGridTemplate = (headerGroups: HeaderGroup[], width: number) => {
    return headerGroups.map(g => `${g.units * width}px`).join(' ');
  }

  const getTaskLevel = (task: Task) => {
    return (task as any).level || 0;
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
    <>
    <div className="p-4 md:p-8 h-full flex flex-col bg-background">
      <header className="mb-6 flex justify-between items-center gap-4 flex-wrap">
        <div>
            <h1 className="text-3xl font-bold font-headline">Gantt Chart</h1>
            <p className="text-muted-foreground mt-1">
            Visualisasikan linimasa proyek dengan dependensi tugas yang interaktif.
            </p>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={setBaseline} className="h-8 px-3">
              <Layers className="mr-2 h-4 w-4" />
              Set Baseline
            </Button>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                {(["Hour", "Day", "Week", "Month", "Year"] as TimeScale[]).map(scale => (
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
                <span className="text-sm text-muted-foreground">Zoom</span>
                <Slider
                    min={timeScale === 'Year' ? 100 : (timeScale === 'Month' ? 50 : (timeScale === 'Week' ? 20 : (timeScale === 'Day' ? 30 : 40)))}
                    max={timeScale === 'Year' ? 300 : (timeScale === 'Month' ? 200 : (timeScale === 'Week' ? 150 : (timeScale === 'Day' ? 100 : 120)))}
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
                <TableRow style={{height: `${HEADER_HEIGHT_PX}px`}} className="hover:bg-transparent border-b">
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
                            onSave={(newTitle) => handleUpdateTask(task.id, { title: newTitle })}
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
                    <TableCell className="text-muted-foreground truncate">{task.dependencies.map(d => d.id).join(', ')}</TableCell>
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
          <div ref={ganttContainerRef} className="overflow-x-auto bg-card">
          <TooltipProvider>
            <div className="relative" style={{ width: `${timelineWidth}px` }}>
              {/* Timeline Header */}
              <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm" style={{height: `${HEADER_HEIGHT_PX}px`}}>
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
                     if((timeScale === 'Day') && secondaryHeaderDates[i]) {
                         const day = secondaryHeaderDates[i];
                         isWeekend = isSaturday(day) || isSunday(day);
                     }
                    
                    return (
                      <div key={i} className={cn(
                        "h-7 flex items-center justify-center border-r border-b border-border/50",
                         isWeekend && 'bg-muted/60'
                      )}>
                        <span className="font-medium text-xs text-muted-foreground">{group.label}</span>
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
                      if ((timeScale === 'Day') && secondaryHeaderDates[i]) {
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
                  <div className="absolute top-0 h-full w-px bg-primary z-20" style={{ left: `${todayPositionX}px` }}>
                    <div className="absolute -top-1 -translate-x-1/2 left-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full px-1.5 py-0.5">
                      Today
                    </div>
                  </div>
                )}
                
                {/* Dependency Lines & Preview */}
                <svg width="100%" height="100%" className="absolute top-0 left-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                      <polygon points="0 0, 8 3, 0 6" className="fill-muted-foreground/50" />
                    </marker>
                     <marker id="arrowhead-critical" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                      <polygon points="0 0, 8 3, 0 6" className="fill-accent" />
                    </marker>
                    <marker id="line-dot" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <circle cx="3" cy="3" r="1.5" className="fill-muted-foreground/50" />
                    </marker>
                    <marker id="line-dot-critical" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                        <circle cx="3" cy="3" r="1.5" className="fill-accent" />
                    </marker>
                  </defs>
                  {/* Existing Dependencies */}
                  {tasks.map((task) => 
                    task.dependencies.map(dep => {
                      const fromNode = nodeMap.get(dep.id);
                      const toNode = nodeMap.get(task.id);
                      if (!fromNode || !toNode || !isValid(fromNode.endDate) || !isValid(toNode.startDate)) return null;

                      const isCritical = fromNode.isCritical && toNode.isCritical;
                      const fromPosition = getTaskPosition(fromNode.startDate.toISOString(), fromNode.endDate.toISOString());
                      const toPosition = getTaskPosition(toNode.startDate.toISOString(), toNode.endDate.toISOString());
                      
                      const fromIsMilestone = fromNode.startDate.getTime() === fromNode.endDate.getTime();
                      const toIsMilestone = toNode.startDate.getTime() === toNode.endDate.getTime();

                      const fromX = fromIsMilestone ? fromPosition.left : fromPosition.left + fromPosition.width;
                      const toX = toPosition.left;
                      
                      const startPointX = fromX;
                      const endPointX = toIsMilestone ? toX - 6 : toX - 8; // smaller offset for milestone diamond
                      const connectorOffset = 20;

                      if (endPointX < startPointX + connectorOffset) {
                           // Complex path for wrapping around
                           return (
                             <path
                               key={`${dep.id}-${task.id}`}
                               d={`M ${startPointX} ${fromNode.y} H ${startPointX + connectorOffset} V ${(fromNode.y + toNode.y) / 2} H ${endPointX - connectorOffset} V ${toNode.y} H ${endPointX}`}
                               stroke={isCritical ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.5)"}
                               strokeWidth="1.5"
                               fill="none"
                               markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                               markerStart={isCritical ? "url(#line-dot-critical)" : "url(#line-dot)"}
                             />
                           )
                      }
                      
                      return (
                        <path 
                          key={`${dep.id}-${task.id}`}
                          d={`M ${startPointX} ${fromNode.y} H ${startPointX + connectorOffset} V ${toNode.y} H ${endPointX}`}
                          stroke={isCritical ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.5)"}
                          strokeWidth="1.5"
                          fill="none"
                          markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                          markerStart={isCritical ? "url(#line-dot-critical)" : "url(#line-dot)"}
                        />
                      )
                    })
                  )}
                  {/* New Dependency Preview Line */}
                  {newDependency && (
                    <line
                      x1={newDependency.startX}
                      y1={newDependency.startY}
                      x2={newDependency.endX}
                      y2={newDependency.endY}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                </svg>

                {/* Task Bars & Milestones */}
                {tasks.map((task, index) => {
                  const { left, width } = getTaskPosition(task.startDate, task.endDate);
                  if (width < 0 && task.startDate !== task.endDate) return null;
                  const progress = statusProgress[task.status] || 0;
                  const isSummary = task.type !== 'Activity';
                  const isMilestone = task.startDate === task.endDate;

                  // Baseline calculations
                  let baselineLeft = 0, baselineWidth = 0, baselineExists = false;
                  if (task.baselineStartDate && task.baselineEndDate) {
                      const baselinePos = getTaskPosition(task.baselineStartDate, task.baselineEndDate);
                      baselineLeft = baselinePos.left;
                      baselineWidth = baselinePos.width;
                      baselineExists = true;
                  }

                  if (isMilestone) {
                    return (
                      <Tooltip key={task.id}>
                        <TooltipTrigger asChild>
                          <div
                            onDoubleClick={() => setEditingTask(task)}
                            onMouseDown={(e) => handleDragStart(e, task, 'move')}
                            className="absolute top-0 flex items-center justify-center z-10 cursor-pointer"
                            style={{
                              left: `${left - 12}`, // Center the diamond
                              top: `${index * ROW_HEIGHT_PX + (ROW_HEIGHT_PX / 2)}px`,
                              transform: 'translateY(-50%)',
                              width: 24,
                              height: 24,
                            }}
                          >
                           <div data-handle-type="milestone" data-task-id={task.id} className="w-full h-full flex items-center justify-center">
                            <Diamond className={cn("h-6 w-6", task.isCritical ? "text-accent fill-accent" : "text-foreground fill-foreground" )} />
                           </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{task.title}</p>
                          <p className="text-muted-foreground">{format(parseISO(task.startDate), 'd MMM yyyy, HH:mm')}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  const isDraggable = task.type === 'Activity';
                  const baselineDeviation = (baselineExists && isValid(parseISO(task.endDate)) && isValid(parseISO(task.baselineEndDate))) 
                    ? differenceInDays(parseISO(task.endDate), parseISO(task.baselineEndDate)) 
                    : 0;

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
                              onDoubleClick={() => setEditingTask(task)}
                              onMouseDown={(e) => isDraggable && handleDragStart(e, task, 'move')}
                              data-task-id={task.id}
                              className={cn(
                                "relative h-8 w-full flex items-center rounded-sm text-primary-foreground overflow-visible shadow-sm z-10",
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
                              
                              {/* Drag Handles for Resize */}
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

                               {baselineExists && baselineDeviation !== 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-30">
                                      <Triangle className={cn("h-3 w-3", baselineDeviation > 0 ? "fill-red-500 text-red-500" : "fill-green-500 text-green-500 rotate-180")} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {baselineDeviation > 0 
                                        ? `${baselineDeviation} day(s) behind baseline` 
                                        : `${Math.abs(baselineDeviation)} day(s) ahead of baseline`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                           </div>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p className="font-bold">{task.title}</p>
                           <p className="text-muted-foreground">{`${format(parseISO(task.startDate), 'd MMM, HH:mm')} - ${format(parseISO(task.endDate), 'd MMM, HH:mm')}`}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                       {/* Dependency handles */}
                      {isDraggable && (
                        <>
                           <div 
                            data-handle-type="start"
                            data-task-id={task.id}
                            onMouseDown={(e) => handleDependencyDragStart(e, task.id, 'start')}
                            className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-background cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity z-30" 
                          />
                          <div
                            data-handle-type="end"
                            data-task-id={task.id}
                            onMouseDown={(e) => handleDependencyDragStart(e, task.id, 'end')}
                            className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-background cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity z-30" 
                          />
                        </>
                      )}

                      {/* Baseline Bar */}
                        {baselineExists && (
                             <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                      className="absolute bottom-1 h-2 rounded-sm bg-muted-foreground/50"
                                      style={{
                                          left: `${baselineLeft - left}px`,
                                          width: `${baselineWidth}px`,
                                      }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Baseline: {`${format(parseISO(task.baselineStartDate!), 'd MMM')} - ${format(parseISO(task.baselineEndDate!), 'd MMM yyyy')}`}</p>
                                </TooltipContent>
                            </Tooltip>
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
    {editingTask && (
        <TaskEditorDialog
          open={!!editingTask}
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditingTask(null);
          }}
          task={editingTask}
          allTasks={allTasks}
          teamMembers={teamMembers}
          onSave={(updatedTask) => {
            handleUpdateTask(editingTask.id, updatedTask);
            setEditingTask(null);
          }}
          onDelete={(taskId) => {
            setAllTasks(allTasks.filter(t => t.id !== taskId));
            setEditingTask(null);
          }}
          onUpdateDependencies={handleUpdateDependencies}
        />
      )}
    </>
  );
};

export default GanttChart;

    
