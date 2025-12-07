import { tasks } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GanttChart = () => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalDays = differenceInDays(monthEnd, monthStart) + 1;

  const getTaskPosition = (task) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);

    const startOffset = differenceInDays(startDate, monthStart);
    const duration = differenceInDays(endDate, startDate) + 1;

    const left = (Math.max(0, startOffset) / totalDays) * 100;
    const width = (Math.min(duration, totalDays - startOffset) / totalDays) * 100;

    return { left, width };
  };

  const priorityColors = {
    Urgent: 'bg-red-500',
    High: 'bg-accent',
    Medium: 'bg-yellow-500',
    Low: 'bg-blue-500'
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Gantt Chart</h1>
      <p className="text-muted-foreground mb-8">Visualize your project timeline for the current month.</p>

      <Card>
        <CardContent className="p-0">
          <div className="grid" style={{ gridTemplateColumns: "250px 1fr" }}>
            <div className="font-semibold bg-secondary/50 border-r">
              <div className="h-16 flex items-center px-4 border-b">Tasks</div>
              {tasks.map((task) => (
                <div key={task.id} className="h-16 flex items-center px-4 border-b border-r">
                   <div className="flex items-center gap-3 truncate">
                      {task.assignee?.avatarUrl && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                          <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    <span className="truncate">{task.title}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <div className="relative" style={{width: `${totalDays * 40}px`}}>
                <div className="sticky top-0 z-10 grid bg-secondary/50" style={{ gridTemplateColumns: `repeat(${totalDays}, 40px)` }}>
                  {daysInMonth.map((day, i) => (
                    <div key={i} className="h-16 flex flex-col items-center justify-center border-r border-b">
                      <span className="text-xs">{format(day, 'E')}</span>
                      <span className="font-bold text-lg">{format(day, 'd')}</span>
                    </div>
                  ))}
                </div>
                
                <div className="relative">
                  {tasks.map((task, index) => {
                    const { left, width } = getTaskPosition(task);
                    return (
                      <div key={task.id} className="relative h-16 border-b flex items-center">
                        <div
                          className={`absolute h-10 rounded-md text-white text-xs flex items-center px-2 truncate transition-all duration-300 ${priorityColors[task.priority]}`}
                          style={{ left: `${left}%`, width: `${width}%`, minWidth: '20px' }}
                          title={`${task.title} (${format(new Date(task.startDate), 'MMM d')} - ${format(new Date(task.endDate), 'MMM d')})`}
                        >
                           <span className="truncate text-primary-foreground font-medium">{task.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttChart;
