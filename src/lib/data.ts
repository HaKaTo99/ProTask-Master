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
  // WBS for eps-1
  {
    id: 'wbs-1.1',
    title: '1.0 Project Initiation & Planning',
    description: 'Initial planning, team formation, and feasibility studies.',
    status: 'Done',
    priority: 'High',
    startDate: '2023-01-15T00:00:00.000Z',
    endDate: '2023-05-30T00:00:00.000Z',
  },
  {
    id: 'wbs-1.2',
    title: '2.0 Core Technology Development',
    description: 'Development of the core engine and infrastructure.',
    status: 'In Progress',
    priority: 'Urgent',
    startDate: '2023-06-01T00:00:00.000Z',
    endDate: '2024-06-30T00:00:00.000Z',
  },
  {
    id: 'wbs-1.3',
    title: '3.0 Feature Development (Alpha/Beta)',
    description: 'Implementation of key features for Alpha and Beta releases.',
    status: 'In Progress',
    priority: 'High',
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2025-09-30T00:00:00.000Z',
  },
  {
    id: 'wbs-1.4',
    title: '4.0 Go-to-Market & Launch',
    description: 'Marketing, partnerships, and public launch activities.',
    status: 'To Do',
    priority: 'High',
    startDate: '2025-10-01T00:00:00.000Z',
    endDate: '2026-06-30T00:00:00.000Z',
  },
  {
    id: 'wbs-1.5',
    title: '5.0 Post-Launch & V2 Planning',
    description: 'Post-launch support, monitoring, and planning for version 2.',
    status: 'To Do',
    priority: 'Medium',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2027-12-31T00:00:00.000Z',
  },
  // Activities for wbs-1.1
  {
    id: 'act-1.1.1',
    title: '1.1 Market Research',
    description: 'In-depth analysis of market trends and competitors.',
    status: 'Done',
    priority: 'High',
    assignee: teamMembers[2],
    startDate: '2023-01-15T00:00:00.000Z',
    endDate: '2023-03-15T00:00:00.000Z',
  },
  {
    id: 'act-1.1.2',
    title: '1.2 Technical Feasibility Study',
    description: 'Evaluate technical requirements and potential challenges.',
    status: 'Done',
    priority: 'High',
    assignee: teamMembers[4],
    startDate: '2023-03-16T00:00:00.000Z',
    endDate: '2023-05-30T00:00:00.000Z',
  },
    // Activities for wbs-1.2
  {
    id: 'act-1.2.1',
    title: '2.1 Architecture Design',
    description: 'Design the core system architecture and data models.',
    status: 'Done',
    priority: 'Urgent',
    assignee: teamMembers[4],
    startDate: '2023-06-01T00:00:00.000Z',
    endDate: '2023-09-01T00:00:00.000Z',
  },
  {
    id: 'act-1.2.2',
    title: '2.2 Backend Prototyping (Go & Kubernetes)',
    description: 'Develop backend prototype.',
    status: 'In Progress',
    priority: 'Urgent',
    assignee: teamMembers[4],
    startDate: '2023-09-02T00:00:00.000Z',
    endDate: '2024-03-30T00:00:00.000Z',
  },
    // Activities for wbs-1.3
  {
    id: 'act-1.3.1',
    title: '3.1 User Authentication Module',
    description: 'Implement secure user login and registration.',
    status: 'In Progress',
    priority: 'High',
    assignee: teamMembers[0],
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2024-10-01T00:00:00.000Z',
  },
  {
    id: 'act-1.3.2',
    title: '3.2 Data Analytics Dashboard',
    description: 'Build the main dashboard with key metrics.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[1],
    startDate: '2024-10-02T00:00:00.000Z',
    endDate: '2025-03-30T00:00:00.000Z',
  },
  // Activities for wbs-1.4
  {
    id: 'act-1.4.1',
    title: '4.1 Marketing Website Launch',
    description: 'Launch the official product marketing website.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[0],
    startDate: '2025-10-01T00:00:00.000Z',
    endDate: '2026-01-15T00:00:00.000Z',
  },
  // Activities for wbs-1.5
  {
    id: 'act-1.5.1',
    title: '5.1 Gen 2 Feature Planning',
    description: 'Plan the feature set for the second generation of the product.',
    status: 'To Do',
    priority: 'Medium',
    assignee: teamMembers[1],
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2027-02-15T00:00:00.000Z',
  },

  // NEW PROJECT 1: 6-month duration
  {
    id: 'eps-2',
    title: 'Mobile App Refresh 2024',
    description: 'A 6-month project to redesign and update the mobile application.',
    status: 'To Do',
    priority: 'High',
    startDate: '2024-03-01T00:00:00.000Z',
    endDate: '2024-08-31T00:00:00.000Z',
  },
  {
    id: 'wbs-2.1',
    title: '1.0 UI/UX Redesign',
    description: 'Redesign of the user interface and experience.',
    status: 'To Do',
    priority: 'High',
    startDate: '2024-03-01T00:00:00.000Z',
    endDate: '2024-05-31T00:00:00.000Z',
  },
  {
    id: 'act-2.1.1',
    title: '1.1 User Research & Wireframing',
    description: 'Conduct user research and create new wireframes.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[0],
    startDate: '2024-03-01T00:00:00.000Z',
    endDate: '2024-04-15T00:00:00.000Z',
  },
  {
    id: 'act-2.1.2',
    title: '1.2 High-Fidelity Mockups',
    description: 'Create detailed mockups based on wireframes.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[0],
    startDate: '2024-04-16T00:00:00.000Z',
    endDate: '2024-05-31T00:00:00.000Z',
  },
  {
    id: 'wbs-2.2',
    title: '2.0 Development & Testing',
    description: 'Implementation and testing of the new design.',
    status: 'To Do',
    priority: 'High',
    startDate: '2024-06-01T00:00:00.000Z',
    endDate: '2024-08-31T00:00:00.000Z',
  },
  {
    id: 'act-2.2.1',
    title: '2.1 Frontend Implementation',
    description: 'Code the new UI components.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[0],
    startDate: '2024-06-01T00:00:00.000Z',
    endDate: '2024-07-31T00:00:00.000Z',
  },

  // NEW PROJECT 2: 1-year duration
  {
    id: 'eps-3',
    title: 'Customer Data Platform (CDP) Integration',
    description: 'A 1-year project to integrate a new CDP.',
    status: 'To Do',
    priority: 'Medium',
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2025-06-30T00:00:00.000Z',
  },
  {
    id: 'wbs-3.1',
    title: '1.0 Vendor Selection & API Analysis',
    description: 'Select a CDP vendor and analyze their API.',
    status: 'To Do',
    priority: 'High',
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2024-09-30T00:00:00.000Z',
  },
  {
    id: 'act-3.1.1',
    title: '1.1 Evaluate Top 3 Vendors',
    description: 'Proof of concept with the top 3 vendors.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[1],
    startDate: '2024-07-01T00:00:00.000Z',
    endDate: '2024-08-31T00:00:00.000Z',
  },
  {
    id: 'wbs-3.2',
    title: '2.0 Implementation',
    description: 'Implement the selected CDP.',
    status: 'To Do',
    priority: 'Medium',
    startDate: '2024-10-01T00:00:00.000Z',
    endDate: '2025-06-30T00:00:00.000Z',
  },
  {
    id: 'act-3.2.1',
    title: '2.1 Data Migration',
    description: 'Migrate customer data to the new platform.',
    status: 'To Do',
    priority: 'Medium',
    assignee: teamMembers[1],
    startDate: '2024-10-01T00:00:00.000Z',
    endDate: '2025-01-31T00:00:00.000Z',
  },

  // NEW PROJECT 3: 2-year duration
  {
    id: 'eps-4',
    title: 'Global Expansion Initiative',
    description: 'A 2-year project for global market expansion.',
    status: 'To Do',
    priority: 'High',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
  },
  {
    id: 'wbs-4.1',
    title: '1.0 Europe Market Entry',
    description: 'Launch in key European markets.',
    status: 'To Do',
    priority: 'High',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T00:00:00.000Z',
  },
  {
    id: 'act-4.1.1',
    title: '1.1 Legal & Compliance Setup (EU)',
    description: 'Ensure compliance with GDPR and other EU regulations.',
    status: 'To Do',
    priority: 'Urgent',
    assignee: teamMembers[2],
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-06-30T00:00:00.000Z',
  },
  {
    id: 'wbs-4.2',
    title: '2.0 Asia Market Entry',
    description: 'Launch in key Asian markets.',
    status: 'To Do',
    priority: 'High',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
  },
  {
    id: 'act-4.2.1',
    title: '2.1 Localisation for Japan & Korea',
    description: 'Translate and adapt product for Japan and Korea.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[4],
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-07-31T00:00:00.000Z',
  },

  // NEW PROJECT 4: 1.5-year duration
  {
    id: 'eps-5',
    title: 'AI Feature Development',
    description: 'Project to develop and integrate new AI-powered features.',
    status: 'To Do',
    priority: 'Urgent',
    startDate: '2025-06-01T00:00:00.000Z',
    endDate: '2026-11-30T00:00:00.000Z',
  },
  {
    id: 'wbs-5.1',
    title: '1.0 R&D and Model Training',
    description: 'Research and train machine learning models.',
    status: 'To Do',
    priority: 'Urgent',
    startDate: '2025-06-01T00:00:00.000Z',
    endDate: '2026-02-28T00:00:00.000Z',
  },
  {
    id: 'act-5.1.1',
    title: '1.1 Data Collection & Cleaning',
    description: 'Gather and prepare data for model training.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[1],
    startDate: '2025-06-01T00:00:00.000Z',
    endDate: '2025-10-31T00:00:00.000Z',
  },
  {
    id: 'wbs-5.2',
    title: '2.0 Feature Integration',
    description: 'Integrate trained models into the main application.',
    status: 'To Do',
    priority: 'High',
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-11-30T00:00:00.000Z',
  },
  {
    id: 'act-5.2.1',
    title: '2.1 API Development for AI Service',
    description: 'Build the API endpoints for the new AI features.',
    status: 'To Do',
    priority: 'High',
    assignee: teamMembers[4],
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-08-31T00:00:00.000Z',
  },
];

function getTaskType(id: string): 'EPS' | 'WBS' | 'Activity' {
  if (id.startsWith('eps')) return 'EPS';
  if (id.startsWith('wbs')) return 'WBS';
  return 'Activity';
}

function getParentId(id: string): string | null {
    if (id.startsWith('wbs-')) {
        const epsNum = id.split('-')[1].split('.')[0];
        return `eps-${epsNum}`;
    }
    if (id.startsWith('act-')) {
        const parts = id.split('-')[1].split('.');
        const epsNum = parts[0];
        const wbsNum = parts[1];
        return `wbs-${epsNum}.${wbsNum}`;
    }
    return null;
}

function getDependencies(id: string): string[] {
    const deps: { [key: string]: string[] } = {
        'act-1.1.2': ['act-1.1.1'],
        'wbs-1.2': ['wbs-1.1'],
        'act-1.2.1': ['act-1.2.2'],
        'act-1.2.2': ['act-1.2.1'],
        'wbs-1.3': ['wbs-1.2'],
        'act-1.3.1': ['act-1.2.2'],
        'act-1.3.2': ['act-1.3.1'],
        'wbs-1.4': ['wbs-1.3'],
        'act-1.4.1': ['wbs-1.3'],
        'wbs-1.5': ['wbs-1.4'],
        'act-1.5.1': ['act-1.4.1'],
        'act-2.1.2': ['act-2.1.1'],
        'wbs-2.2': ['wbs-2.1'],
        'act-2.2.1': ['act-2.1.2'],
        'wbs-3.2': ['wbs-3.1'],
        'act-3.2.1': ['act-3.1.1'],
        'wbs-4.2': ['wbs-4.1'],
        'act-4.2.1': ['act-4.1.1'],
        'wbs-5.2': ['wbs-5.1'],
        'act-5.2.1': ['act-5.1.1'],
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
    if (visited.has(taskId) || !taskMap.has(taskId)) return;
    visited.add(taskId);
    
    const task = taskMap.get(taskId);
    if (!task) return;

    // Add the parent task itself
    sortedTasks.push(task);

    // Find and visit children
    const children = processedTasks
      .filter(t => t.parentId === taskId)
      .sort((a, b) => a.id.localeCompare(b.id));

    children.forEach(child => visit(child.id));
}

// Find all root nodes (EPS) and start visiting from them
const rootNodes = processedTasks.filter(task => task.type === 'EPS').sort((a,b) => a.id.localeCompare(b.id));
rootNodes.forEach(root => visit(root.id));

export const tasks: Task[] = sortedTasks;
