import { TeamMember, Task } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const now = new Date();

export const teamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar1')?.imageUrl || '',
    skills: ['JavaScript', 'React', 'Node.js', 'UI/UX Design', 'Vocal Production'],
    currentWorkload: 5,
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar2')?.imageUrl || '',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'Databases', 'Audio Engineering'],
    currentWorkload: 3,
  },
  {
    id: 'user-3',
    name: 'James Smith',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar3')?.imageUrl || '',
    skills: ['Project Management', 'Agile', 'Scrum', 'Team Leadership', 'Songwriting'],
    currentWorkload: 7,
  },
  {
    id: 'user-4',
    name: 'Priya Patel',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar4')?.imageUrl || '',
    skills: ['Quality Assurance', 'Test Automation', 'CI/CD', 'DevOps', 'Mastering'],
    currentWorkload: 4,
  },
  {
    id: 'user-5',
    name: 'Kenji Tanaka',
    avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar5')?.imageUrl || '',
    skills: ['Go', 'Kubernetes', 'Cloud Infrastructure', 'System Architecture', 'Sound Design'],
    currentWorkload: 6,
  },
];

const rawTasks: Omit<Task, 'type' | 'parentId' | 'dependencies'>[] = [
  // EPS
  {
    id: 'eps-1',
    title: 'NextGen Platform Development',
    description: 'Overall project for developing the next generation platform.',
    status: 'In Progress',
    priority: 'High',
    startDate: '2023-01-15T00:00:00.000Z',
    endDate: '2027-12-31T00:00:00.000Z',
  },
  // WBS
  {
    id: 'wbs-1',
    title: '1.0 Project Initiation & Planning',
    description: 'Initial planning, team formation, and feasibility studies.',
    status: 'Done',
    priority: 'High',
    startDate: '2023-01-15T00:00:00.000Z',
    endDate: '2023-05-30T00:00:00.000Z',
  },
  {
    id: 'wbs-2',
    title: '2.0 Core Technology Development',
    description: 'Development of the core engine and infrastructure.',
    status: 'In Progress',
    priority: 'Urgent',
    startDate: '2023-06-01T00:00:00.000Z',
    endDate: '2024-06-30T00:00:00.000Z',
  },
  {
    id: 'wbs-3',
    title: '3.0 Feature Development (Alpha/Beta)',
    description: 'Implementation of key features for Alpha and Beta releases.',
    status: 'In Progress',
    priority: 'High',
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2025-09-30T00:00:00.000Z',
  },
  {
    id: 'wbs-4',
    title: '4.0 Go-to-Market & Launch',
    description: 'Marketing, partnerships, and public launch activities.',
    status: 'To Do',
    priority: 'High',
    startDate: '2025-10-01T00:00:00.000Z',
    endDate: '2026-06-30T00:00:00.000Z',
  },
  {
    id: 'wbs-5',
    title: '5.0 Post-Launch & V2 Planning',
    description: 'Post-launch support, monitoring, and planning for version 2.',
    status: 'To Do',
    priority: 'Medium',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2027-12-31T00:00:00.000Z',
  },
  // Activities
  {
    id: 'act-1.1',
    title: '1.1 Market Research',
    description: 'In-depth analysis of market trends and competitors.',
    status: 'Done',
    priority: 'High',
    assignee: teamMembers[2],
    startDate: '2023-01-15T00:00:00.000Z',
    endDate: '2023-03-15T00:00:00.000Z',
  },
  {
    id: 'act-1.2',
    title: '1.2 Technical Feasibility Study',
    description: 'Evaluate technical requirements and potential challenges.',
    status: 'Done',
    priority: 'High',
    assignee: teamMembers[4],
    startDate: '2023-03-16T00:00:00.000Z',
    endDate: '2023-05-30T00:00:00.000Z',
  },
  {
    id: 'act-2.1',
    title: '2.1 Architecture Design',
    description: 'Design the core system architecture and data models.',
    status: 'Done',
    priority: 'Urgent',
    assignee: teamMembers[4],
    startDate: '2023-06-01T00:00:00.000Z',
    endDate: '2023-09-01T00:00:00.000Z',
  },
  {
    id: 'act-2.2',
    title: '2.2 Backend Prototyping (Go & Kubernetes)',
    description: 'Develop backend prototype.',
    status: 'In Progress',
    priority: 'Urgent',
    assignee: teamMembers[4],
    startDate: '2023-09-02T00:00:00.000Z',
    endDate: '2024-03-30T00:00:00.000Z',
  },
  {
    id: 'act-3.1',
    title: '3.1 User Authentication Module',
    description: 'Implement secure user login and registration.',
    status: 'In Progress',
    priority: 'High',
    assignee: teamMembers[0],
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2024-10-01T00:00:00.000Z',
  },
  {
    id: 'act-3.2',
    title: '3.2 Data Analytics Dashboard',
    description: 'Build the main dashboard with key metrics.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[1],
    startDate: '2024-10-02T00:00:00.000Z',
    endDate: '2025-03-30T00:00:00.000Z',
  },
  {
    id: 'act-4.1',
    title: '4.1 Marketing Website Launch',
    description: 'Launch the official product marketing website.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[0],
    startDate: '2025-10-01T00:00:00.000Z',
    endDate: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'act-5.1',
    title: '5.1 Gen 2 Feature Planning',
    description: 'Plan the feature set for the second generation of the product.',
    status: 'To Do',
    priority: 'Medium',
    assignee: teamMembers[1],
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2027-02-15T00:00:00.000Z',
  },
];

function getTaskType(id: string): 'EPS' | 'WBS' | 'Activity' {
  if (id.startsWith('eps')) return 'EPS';
  if (id.startsWith('wbs')) return 'WBS';
  return 'Activity';
}

function getParentId(id: string): string | null {
    if (id.startsWith('wbs')) return 'eps-1';
    if (id.startsWith('act')) {
        const wbsNum = id.split('-')[1].split('.')[0];
        return `wbs-${wbsNum}`;
    }
    return null;
}

function getDependencies(id: string): string[] {
    const deps: { [key: string]: string[] } = {
        'act-1.2': ['act-1.1'],
        'wbs-2': ['wbs-1'],
        'act-2.1': ['act-1.2'],
        'act-2.2': ['act-2.1'],
        'wbs-3': ['wbs-2'],
        'act-3.1': ['act-2.2'],
        'act-3.2': ['act-3.1'],
        'wbs-4': ['wbs-3'],
        'act-4.1': ['wbs-3'],
        'wbs-5': ['wbs-4'],
        'act-5.1': ['act-4.1'],
    };
    return deps[id] || [];
}

const processedTasks: Task[] = rawTasks.map(task => ({
  ...task,
  type: getTaskType(task.id),
  parentId: getParentId(task.id),
  dependencies: getDependencies(task.id),
}));

// Create a map and a new array to store the sorted tasks
const taskMap = new Map(processedTasks.map(task => [task.id, task]));
const sortedTasks: Task[] = [];
const visited = new Set<string>();

function visit(taskId: string) {
    if (visited.has(taskId)) return;
    visited.add(taskId);
    
    const task = taskMap.get(taskId);
    if (!task) return;

    // Find children
    const children = processedTasks.filter(t => t.parentId === taskId)
                                   .sort((a, b) => a.id.localeCompare(b.id));

    sortedTasks.push(task);
    children.forEach(child => visit(child.id));
}

// Start with the root EPS node
visit('eps-1');

export const tasks: Task[] = sortedTasks;
