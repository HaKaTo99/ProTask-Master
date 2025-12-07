
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface TaskEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  allTasks: Task[];
  onSave: (updatedTask: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onUpdateDependencies: (taskId: string, newDependencies: string[]) => void;
}

export function TaskEditorDialog({
  open,
  onOpenChange,
  task,
  allTasks,
  onSave,
  onDelete,
  onUpdateDependencies,
}: TaskEditorDialogProps) {
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    // Reset local state when a new task is passed in
    setEditedTask(task);
  }, [task]);
  
  const statusProgress: { [key: string]: number } = {
    'Done': 100,
    'In Progress': 60,
    'Review': 80,
    'To Do': 0,
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date && isValid(date)) {
      setEditedTask(prev => {
        const newValues = { ...prev, [field]: date.toISOString() };
        
        const start = parseISO(newValues.startDate || task.startDate);
        const end = parseISO(newValues.endDate || task.endDate);

        if (isValid(start) && isValid(end) && end < start) {
            if (field === 'startDate') {
                newValues.endDate = newValues.startDate;
            } else {
                newValues.startDate = newValues.endDate;
            }
        }
        return newValues;
      });
    }
  };

  const handleSave = () => {
    onSave(editedTask);
  };
  
  const duration = useMemo(() => {
    const start = editedTask.startDate ? parseISO(editedTask.startDate) : parseISO(task.startDate);
    const end = editedTask.endDate ? parseISO(editedTask.endDate) : parseISO(task.endDate);
    if(isValid(start) && isValid(end)) {
        return differenceInDays(end, start) + 1;
    }
    return 0;
  }, [editedTask.startDate, editedTask.endDate, task.startDate, task.endDate]);


  const getProgressFromStatus = (status: Task['status']) => statusProgress[status] || 0;

  const predecessors = useMemo(() => {
    return (editedTask.dependencies || []).map(depId => {
      return allTasks.find(t => t.id === depId);
    }).filter(Boolean) as Task[];
  }, [editedTask.dependencies, allTasks]);

  const successors = useMemo(() => {
    return allTasks.filter(t => t.dependencies.includes(editedTask.id!));
  }, [editedTask.id, allTasks]);

  const handleRemovePredecessor = (predecessorId: string) => {
    const newDependencies = (editedTask.dependencies || []).filter(depId => depId !== predecessorId);
    onUpdateDependencies(editedTask.id!, newDependencies);
    setEditedTask(prev => ({...prev, dependencies: newDependencies}));
  }

  const handleRemoveSuccessor = (successorId: string) => {
     // This is an indirect action: we must modify the successor task's dependencies
     const successorTask = allTasks.find(t => t.id === successorId);
     if (successorTask) {
       const newSuccessorDeps = successorTask.dependencies.filter(depId => depId !== editedTask.id!);
       onUpdateDependencies(successorId, newSuccessorDeps);
     }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Task information</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="px-6 border-b rounded-none justify-start bg-transparent">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="predecessors">Predecessors</TabsTrigger>
            <TabsTrigger value="successors">Successors</TabsTrigger>
            <TabsTrigger value="resources" disabled>Resources</TabsTrigger>
            <TabsTrigger value="advanced" disabled>Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={editedTask.title || ''} 
                  onChange={(e) => handleChange('title', e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percent-complete">% complete</Label>
                  <Input 
                    id="percent-complete" 
                    type="number" 
                    value={getProgressFromStatus(editedTask.status || task.status)} 
                    // This is derived, so not directly editable unless we change the model
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effort">Effort</Label>
                  <Input id="effort" value="120 hours" disabled />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                 <h4 className="text-sm font-medium text-muted-foreground text-center">Dates</h4>
                 <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Start</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !editedTask.startDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editedTask.startDate ? format(parseISO(editedTask.startDate), "MM/dd/yyyy") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={editedTask.startDate ? parseISO(editedTask.startDate) : undefined}
                                onSelect={(date) => handleDateChange('startDate', date)}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="finish-date">Finish</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !editedTask.endDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editedTask.endDate ? format(parseISO(editedTask.endDate), "MM/dd/yyyy") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={editedTask.endDate ? parseISO(editedTask.endDate) : undefined}
                                onSelect={(date) => handleDateChange('endDate', date)}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input id="duration" value={`${duration} day(s)`} disabled />
                    </div>
                 </div>
              </div>

            </div>
          </TabsContent>
          <TabsContent value="predecessors" className="p-6 min-h-[300px]">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {predecessors.length > 0 ? (
                        predecessors.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.title}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className='h-8 w-8 text-muted-foreground' onClick={() => handleRemovePredecessor(p.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">No predecessors</TableCell>
                        </TableRow>
                    )}
                </TableBody>
             </Table>
          </TabsContent>
           <TabsContent value="successors" className="p-6 min-h-[300px]">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {successors.length > 0 ? (
                        successors.map(s => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.title}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className='h-8 w-8 text-muted-foreground' onClick={() => handleRemoveSuccessor(s.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">No successors</TableCell>
                        </TableRow>
                    )}
                </TableBody>
             </Table>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-6 bg-secondary/50 border-t flex justify-between w-full">
          <div>
            <Button variant="destructive" onClick={() => onDelete(task.id)}>Delete</Button>
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
