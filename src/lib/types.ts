export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TeamMember = {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  currentWorkload: number;
};

export type DependencyType = 'Finish-to-Start' | 'Start-to-Start' | 'Finish-to-Finish' | 'Start-to-Finish';

export type Dependency = {
  id: string; // The ID of the task this task depends on (the predecessor)
  type: DependencyType;
  lag: number; // in days
};


export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assignee?: TeamMember;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  dependencies: Dependency[]; // array of dependency objects
  type: 'EPS' | 'WBS' | 'Activity';
  parentId?: string | null;
  isCritical?: boolean;
  baselineStartDate?: string;
  baselineEndDate?: string;
};
