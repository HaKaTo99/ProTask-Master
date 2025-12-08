
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import type { Task, Dependency, DependencyType } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';

interface TaskEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  allTasks: Task[];
  onSave: (updatedTask: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onUpdateDependencies: (taskId: string, newDependencies: Dependency[]) => void;
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
  const [editedTask, setEditedTask] = useState<Partial<Task>>(task);
  const [newPredecessor, setNewPredecessor] = useState('');
  const [selectedPredecessors, setSelectedPredecessors] = useState<Set<string>>(new Set());
  const [selectedSuccessors, setSelectedSuccessors] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Reset local state when a new task is passed in
    setEditedTask(task);
    setNewPredecessor('');
    setSelectedPredecessors(new Set());
    setSelectedSuccessors(new Set());
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
    // We only call onSave for task properties, dependencies are handled separately
    const { dependencies, ...taskData } = editedTask;
    onSave(taskData);
    if(dependencies) {
      onUpdateDependencies(task.id, dependencies);
    }
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
    const taskMap = new Map(allTasks.map(t => [t.id, t.title]));
    return (editedTask.dependencies || []).map(dep => ({
      ...dep,
      name: taskMap.get(dep.id) || 'Unknown Task'
    }));
  }, [editedTask.dependencies, allTasks]);


  const handleRemovePredecessors = () => {
    const newDependencies = (editedTask.dependencies || []).filter(dep => !selectedPredecessors.has(dep.id));
    setEditedTask(prev => ({...prev, dependencies: newDependencies}));
    setSelectedPredecessors(new Set());
  }

  const potentialPredecessors = useMemo(() => {
    const predecessorIds = new Set((editedTask.dependencies || []).map(p => p.id));
    const visited = new Set<string>();
    const stack = allTasks.filter(t => t.dependencies.some(d => d.id === task.id)).map(t => t.id);
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const successorsOfCurrent = allTasks.filter(t => t.dependencies.some(d => d.id === currentId));
      successorsOfCurrent.forEach(s => stack.push(s.id));
    }

    return allTasks.filter(t => t.id !== task.id && !predecessorIds.has(t.id) && !visited.has(t.id));
  }, [allTasks, task.id, editedTask.dependencies]);

  const handleAddPredecessor = (id: string) => {
    if (!id || !task.id) return;
    const newDep: Dependency = { id: id, type: 'Finish-to-Start', lag: 0 };
    const newDependencies = [...(editedTask.dependencies || []), newDep];
    setEditedTask(prev => ({...prev, dependencies: newDependencies}));
    setNewPredecessor('');
  };
  
  const handleUpdatePredecessor = (id: string, updatedProps: Partial<Dependency>) => {
    const newDependencies = (editedTask.dependencies || []).map(dep => 
      dep.id === id ? { ...dep, ...updatedProps } : dep
    );
    setEditedTask(prev => ({ ...prev, dependencies: newDependencies }));
  };
  
  const successors = useMemo(() => {
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    return allTasks.filter(t => t.dependencies.some(dep => dep.id === editedTask.id!))
      .map(s => ({
        id: s.id,
        name: s.title,
        ...(s.dependencies.find(d => d.id === editedTask.id!))!
      }));
  }, [editedTask.id, allTasks]);
  
  const handleRemoveSuccessors = () => {
    selectedSuccessors.forEach(successorId => {
      const successor = allTasks.find(t => t.id === successorId);
      if (successor) {
        const newDeps = successor.dependencies.filter(d => d.id !== task.id);
        onUpdateDependencies(successorId, newDeps);
      }
    });
    setSelectedSuccessors(new Set());
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Task information</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <div className="px-6 border-b">
            <TabsList className="grid grid-cols-5 w-full max-w-lg bg-transparent p-0">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="predecessors">Predecessors</TabsTrigger>
                <TabsTrigger value="successors">Successors</TabsTrigger>
                <TabsTrigger value="resources" disabled>Resources</TabsTrigger>
                <TabsTrigger value="advanced" disabled>Advanced</TabsTrigger>
            </TabsList>
          </div>

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
                    disabled 
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editedTask.status || task.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(statusProgress).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                   <Select
                    value={editedTask.priority || task.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <TabsContent value="predecessors" className="p-0 min-h-[350px]">
            <div className="border-b p-2 flex items-center gap-2">
                <Select value={newPredecessor} onValueChange={handleAddPredecessor}>
                    <SelectTrigger className="w-auto h-8 border-none focus:ring-0 shadow-none">
                       <div className="flex items-center gap-2">
                         <Plus className="h-4 w-4 text-muted-foreground"/>
                         <span className="text-muted-foreground">Add new predecessor</span>
                       </div>
                    </SelectTrigger>
                    <SelectContent>
                        {potentialPredecessors.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemovePredecessors} disabled={selectedPredecessors.size === 0}>
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                           <Checkbox 
                             checked={predecessors.length > 0 && selectedPredecessors.size === predecessors.length}
                             onCheckedChange={(checked) => {
                                if(checked) {
                                  setSelectedPredecessors(new Set(predecessors.map(p => p.id)));
                                } else {
                                  setSelectedPredecessors(new Set());
                                }
                             }}
                           />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Lag</TableHead>
                        <TableHead className="w-[80px]">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {predecessors.length > 0 ? (
                        predecessors.map(p => (
                            <TableRow key={p.id} data-state={selectedPredecessors.has(p.id) && "selected"}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedPredecessors.has(p.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedPredecessors(prev => {
                                                const newSet = new Set(prev);
                                                if (checked) newSet.add(p.id);
                                                else newSet.delete(p.id);
                                                return newSet;
                                            })
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell>
                                  <Select 
                                    value={p.type} 
                                    onValueChange={(val) => handleUpdatePredecessor(p.id, { type: val as DependencyType })}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Finish-to-Start">Finish-to-Start</SelectItem>
                                      <SelectItem value="Start-to-Start">Start-to-Start</SelectItem>
                                      <SelectItem value="Finish-to-Finish">Finish-to-Finish</SelectItem>
                                      <SelectItem value="Start-to-Finish">Start-to-Finish</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    type="text" 
                                    value={`${p.lag} day(s)`} 
                                    onChange={(e) => handleUpdatePredecessor(p.id, { lag: parseInt(e.target.value) || 0 })}
                                    className="h-8 text-xs"
                                  />
                                </TableCell>
                                <TableCell>
                                    <Checkbox checked={true} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">No predecessors</TableCell>
                        </TableRow>
                    )}
                </TableBody>
             </Table>
          </TabsContent>
           <TabsContent value="successors" className="p-0 min-h-[300px]">
             <div className="border-b p-2 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemoveSuccessors} disabled={selectedSuccessors.size === 0}>
                    <Trash2 className="h-4 w-4"/>
                </Button>
            </div>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                           <Checkbox 
                             checked={successors.length > 0 && selectedSuccessors.size === successors.length}
                             onCheckedChange={(checked) => {
                                if(checked) {
                                  setSelectedSuccessors(new Set(successors.map(s => s.id)));
                                } else {
                                  setSelectedSuccessors(new Set());
                                }
                             }}
                           />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Lag</TableHead>
                        <TableHead className="w-[80px]">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {successors.length > 0 ? (
                        successors.map(s => (
                            <TableRow key={s.id} data-state={selectedSuccessors.has(s.id) && "selected"}>
                                 <TableCell>
                                    <Checkbox
                                        checked={selectedSuccessors.has(s.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedSuccessors(prev => {
                                                const newSet = new Set(prev);
                                                if (checked) newSet.add(s.id);
                                                else newSet.delete(s.id);
                                                return newSet;
                                            })
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{s.name}</TableCell>
                                <TableCell>{s.type}</TableCell>
                                <TableCell>{s.lag} days</TableCell>
                                <TableCell>
                                    <Checkbox checked={true} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">No successors</TableCell>
                        </TableRow>
                    )}
                </TableBody>
             </Table>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-6 bg-secondary/50 border-t flex justify-between w-full">
          <div>
            <Button variant="destructive" onClick={() => {
                onDelete(task.id);
                onOpenChange(false);
            }}>Delete</Button>
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={() => {
                handleSave();
                onOpenChange(false);
            }}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
