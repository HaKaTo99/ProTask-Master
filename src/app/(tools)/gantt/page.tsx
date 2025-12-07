import { tasks } from "@/lib/data";
import { Card } from "@/components/ui/card";
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
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
import { Badge } from "@/components/ui/badge";

type Node = {
  id: string;
  startDate: Date;
  endDate: Date;
  y: number;
};

const GanttChart = () => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalDays = differenceInDays(monthEnd, monthStart) + 1;

  const getTaskPosition = (taskStartDate: string, taskEndDate: string) => {
    const startDate = parseISO(taskStartDate);
    const endDate = parseISO(taskEndDate);

    const startOffset = differenceInDays(startDate, monthStart);
    const duration = differenceInDays(endDate, startDate) + 1;

    const left = (Math.max(0, startOffset) / totalDays) * 100;
    const width = (Math.min(duration, totalDays - startOffset) / totalDays) * 100;

    return { left, width };
  };
  
  const priorityColors: { [key: string]: string } = {
    Urgent: 'bg-red-500',
    High: 'bg-primary',
    Medium: 'bg-yellow-500',
    Low: 'bg-blue-500'
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
      y: index * 64 + 32, // 64px row height, 32px is half to center the line
    }))
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Gantt Chart</h1>
      <p className="text-muted-foreground mb-8">
        Visualisasikan linimasa proyek dengan dependensi tugas.
      </p>

      <Card className="overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "minmax(350px, 1.2fr) 2fr" }}>
          {/* Task Details Column */}
          <div className="border-r">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="h-16 w-[250px]">Task Name</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="h-16">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {task.assignee?.avatarUrl && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                            <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <span className="font-medium truncate">{task.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(parseISO(task.startDate), 'MMM d')}</TableCell>
                    <TableCell className="text-muted-foreground">{format(parseISO(task.endDate), 'MMM d')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Timeline Column */}
          <div className="overflow-x-auto">
            <div className="relative" style={{ width: `${totalDays * 50}px` }}>
              {/* Timeline Header */}
              <div className="sticky top-0 z-20 grid bg-secondary/50 backdrop-blur-sm" style={{ gridTemplateColumns: `repeat(${totalDays}, 50px)` }}>
                {daysInMonth.map((day, i) => (
                  <div key={i} className="h-16 flex flex-col items-center justify-center border-r border-b">
                    <span className="text-xs text-muted-foreground">{format(day, 'E')}</span>
                    <span className="font-bold text-lg">{format(day, 'd')}</span>
                  </div>
                ))}
              </div>
              
              <div className="relative">
                {/* Dependency Lines */}
                <svg width="100%" height="100%" className="absolute top-0 left-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" markerUnits="strokeWidth">
                      <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                    </marker>
                  </defs>
                  {tasks.map((task) => 
                    task.dependencies.map(depId => {
                      const fromNode = nodeMap.get(depId);
                      const toNode = nodeMap.get(task.id);
                      if (!fromNode || !toNode) return null;

                      const fromPosition = getTaskPosition(fromNode.startDate.toISOString(), fromNode.endDate.toISOString());
                      const fromX = (fromPosition.left + fromPosition.width) / 100 * (totalDays * 50);

                      const toPosition = getTaskPosition(toNode.startDate.toISOString(), toNode.endDate.toISOString());
                      const toX = toPosition.left / 100 * (totalDays * 50);

                      return (
                        <path 
                          key={`${depId}-${task.id}`}
                          d={`M ${fromX} ${fromNode.y} H ${fromX + 20} V ${toNode.y} H ${toX - 8}`}
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
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
                    <div key={task.id} className="relative h-16 border-b flex items-center pr-2" style={{ paddingLeft: `calc(${left}% + 8px)` }}>
                      <div
                        className="absolute h-10 rounded-md text-white text-xs flex items-center justify-between px-2 truncate transition-all duration-300 group"
                        style={{ left: `${left}%`, width: `calc(${width}% - 1px)`, minWidth: '20px' }}
                        title={`${task.title} (${format(parseISO(task.startDate), 'MMM d')} - ${format(parseISO(task.endDate), 'MMM d')})`}
                      >
                         <div className={`absolute inset-0 rounded-md ${priorityColors[task.priority]} opacity-80`}></div>
                         <div 
                           className="absolute inset-y-0 left-0 bg-primary/70 rounded-md"
                           style={{ width: `${progress}%`}}
                         ></div>
                         <span className="relative truncate text-primary-foreground font-medium z-10">{task.title}</span>
                         <Badge variant="secondary" className="relative z-10 ml-2 group-hover:opacity-100 opacity-0 transition-opacity">{progress}%</Badge>
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
