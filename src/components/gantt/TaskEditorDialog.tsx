
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
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { Task } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSave: (updatedTask: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskEditorDialog({
  open,
  onOpenChange,
  task,
  onSave,
  onDelete,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Task information</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="px-6 border-b rounded-none justify-start bg-transparent">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="predecessors" disabled>Predecessors</TabsTrigger>
            <TabsTrigger value="successors" disabled>Successors</TabsTrigger>
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
