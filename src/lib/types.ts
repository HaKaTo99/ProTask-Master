export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TeamMember = {
  id: string;
  name: string;
  avatarUrl: string;
  skills: string[];
  currentWorkload: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: TeamMember;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  dependencies: string[]; // array of task ids
};
