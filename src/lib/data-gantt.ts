import { TeamMember, Task } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { differenceInDays, parseISO, addDays } from 'date-fns';

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

const rawTasksData: Omit<Task, 'type' | 'parentId' | 'dependencies' | 'isCritical' | 'assignee'>[] = [
  // EPS - Proyek Unggulan 2025
  {
    id: 'eps-1',
    title: 'Proyek Unggulan 2025',
    description: 'Proyek utama untuk tahun 2025.',
    status: 'To Do',
    priority: 'Urgent',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-12-31T00:00:00.000Z',
    assigneeId: undefined,
  },

  // WBS untuk Proyek Unggulan 2025
  {
    id: 'wbs-1.1',
    title: '1.0 Perencanaan & Desain',
    description: 'Fase awal untuk riset, perencanaan, dan desain arsitektur.',
    status: 'To Do',
    priority: 'High',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-02-28T00:00:00.000Z',
    assigneeId: undefined,
  },
  {
    id: 'wbs-1.2',
    title: '2.0 Pengembangan Inti',
    description: 'Pengembangan backend dan infrastruktur dasar.',
    status: 'To Do',
    priority: 'High',
    startDate: '2025-03-01T00:00:00.000Z',
    endDate: '2025-06-30T00:00:00.000Z',
    assigneeId: undefined,
  },
  {
    id: 'wbs-1.3',
    title: '3.0 Implementasi & Pengujian Fitur',
    description: 'Pengembangan frontend, integrasi, dan pengujian fitur.',
    status: 'To Do',
    priority: 'High',
    startDate: '2025-07-01T00:00:00.000Z',
    endDate: '2025-10-31T00:00:00.000Z',
    assigneeId: undefined,
  },
  {
    id: 'wbs-1.4',
    title: '4.0 Peluncuran & Pasca-Peluncuran',
    description: 'Persiapan peluncuran, rilis, dan dukungan awal.',
    status: 'To Do',
    priority: 'Urgent',
    startDate: '2025-11-01T00:00:00.000Z',
    endDate: '2025-12-31T00:00:00.000Z',
    assigneeId: undefined,
  },

  // Aktivitas untuk WBS 1.1 (Perencanaan & Desain)
  {
    id: 'act-1.1.1',
    title: '1.1 Riset Pasar & Analisis Kebutuhan',
    description: 'Menganalisis target pasar dan kebutuhan pengguna.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'user-3',
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-01-31T00:00:00.000Z',
  },
  {
    id: 'act-1.1.2',
    title: '1.2 Desain Arsitektur Sistem',
    description: 'Merancang arsitektur teknis dan model data.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'user-5',
    startDate: '2025-02-01T00:00:00.000Z',
    endDate: '2025-02-28T00:00:00.000Z',
  },
  {
    id: 'milestone-1.1.3',
    title: 'Persetujuan Desain Arsitektur',
    description: 'Persetujuan akhir untuk desain arsitektur.',
    status: 'To Do',
    priority: 'Urgent',
    startDate: '2025-02-28T00:00:00.000Z',
    endDate: '2025-02-28T00:00:00.000Z',
    assigneeId: undefined,
  },

  // Aktivitas untuk WBS 1.2 (Pengembangan Inti)
  {
    id: 'act-1.2.1',
    title: '2.1 Pengaturan Lingkungan Pengembangan',
    description: 'Menyiapkan repositori, CI/CD, dan cloud environment.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'user-4',
    startDate: '2025-03-01T00:00:00.000Z',
    endDate: '2025-03-15T00:00:00.000Z',
  },
  {
    id: 'act-1.2.2',
    title: '2.2 Pengembangan API Backend',
    description: 'Membangun endpoint API utama untuk aplikasi.',
    status: 'To Do',
    priority: 'Urgent',
    assigneeId: 'user-5',
    startDate: '2025-03-16T00:00:00.000Z',
    endDate: '2025-05-31T00:00:00.000Z',
  },
  {
    id: 'act-1.2.3',
    title: '2.3 Implementasi Skema Database',
    description: 'Menerapkan model data ke dalam database.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'user-2',
    startDate: '2025-03-16T00:00:00.000Z',
    endDate: '2025-04-30T00:00:00.000Z',
  },
  
  // Aktivitas untuk WBS 1.3 (Implementasi & Pengujian Fitur)
  {
    id: 'act-1.3.1',
    title: '3.1 Pengembangan UI/UX Frontend',
    description: 'Membangun antarmuka pengguna sesuai dengan desain.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'user-1',
    startDate: '2025-07-01T00:00:00.000Z',
    endDate: '2025-08-31T00:00:00.000Z',
  },
  {
    id: 'act-1.3.2',
    title: '3.2 Pengujian Integrasi',
    description: 'Menguji integrasi antara frontend dan backend.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'user-4',
    startDate: '2025-09-01T00:00:00.000Z',
    endDate: '2025-09-30T00:00:00.000Z',
  },
  {
    id: 'act-1.3.3',
    title: '3.3 Pengujian Penerimaan Pengguna (UAT)',
    description: 'Melibatkan pengguna akhir untuk pengujian beta.',
    status: 'To Do',
    priority: 'Medium',
    assigneeId: 'user-3',
    startDate: '2025-10-01T00:00:00.000Z',
    endDate: '2025-10-31T00:00:00.000Z',
  },

  // Aktivitas untuk WBS 1.4 (Peluncuran & Pasca-Peluncuran)
  {
    id: 'act-1.4.1',
    title: '4.1 Persiapan Infrastruktur Produksi',
    description: 'Menyiapkan server produksi dan melakukan hardening.',
    status: 'To Do',
    priority: 'Urgent',
    assigneeId: 'user-5',
    startDate: '2025-11-01T00:00:00.000Z',
    endDate: '2025-11-30T00:00:00.000Z',
  },
  {
    id: 'milestone-1.4.2',
    title: 'Peluncuran Produk',
    description: 'Rilis resmi produk ke publik.',
    status: 'To Do',
    priority: 'Urgent',
    startDate: '2025-12-15T00:00:00.000Z',
    endDate: '2025-12-15T00:00:00.000Z',
    assigneeId: undefined,
  },
  {
    id: 'act-1.4.3',
    title: '4.2 Dukungan Pasca-Peluncuran & Pemantauan',
    description: 'Memberikan dukungan dan memantau kinerja sistem.',
    status: 'To Do',
    priority: 'High',
    assigneeId: 'user-4',
    startDate: '2025-12-16T00:00:00.000Z',
    endDate: '2025-12-31T00:00:00.000Z',
  },
];

function getTaskType(id: string): 'EPS' | 'WBS' | 'Activity' {
  if (id.startsWith('eps')) return 'EPS';
  if (id.startsWith('wbs')) return 'WBS';
  return 'Activity';
}

function getParentId(id: string): string | null {
    const parts = id.split('-');
    const prefix = parts[0];
    const rest = parts.slice(1).join('-');

    if (prefix === 'wbs') {
        const idParts = rest.split('.');
        if (idParts.length > 1) {
            return `eps-${idParts[0]}`;
        }
    } else if (prefix === 'act' || prefix === 'milestone') {
        const idParts = rest.split('.');
        if (idParts.length > 2) {
             return `wbs-${idParts[0]}.${idParts[1]}`;
        }
    }
    return null;
}

function getDependencies(id: string): string[] {
    const deps: { [key: string]: string[] } = {
        // WBS Dependencies
        'wbs-1.2': ['milestone-1.1.3'],
        'wbs-1.3': ['act-1.2.2', 'act-1.2.3'],
        'wbs-1.4': ['act-1.3.3'],

        // Activity Dependencies
        'act-1.1.2': ['act-1.1.1'],
        'milestone-1.1.3': ['act-1.1.2'],
        'act-1.2.1': ['milestone-1.1.3'],
        'act-1.2.2': ['act-1.2.1'],
        'act-1.2.3': ['act-1.2.1'],
        'act-1.3.1': ['act-1.2.2'],
        'act-1.3.2': ['act-1.3.1'],
        'act-1.3.3': ['act-1.3.2'],
        'act-1.4.1': ['act-1.3.3'],
        'milestone-1.4.2': ['act-1.4.1'],
        'act-1.4.3': ['milestone-1.4.2'],
    };
    return deps[id] || [];
}

const baseTasks: Task[] = rawTasksData.map(task => {
    const isMilestone = task.id.startsWith('milestone-');
    const parentId = getParentId(task.id);
    let type: 'EPS' | 'WBS' | 'Activity' = 'Activity';
    if (isMilestone) {
        type = 'Activity'; // Treat milestones as a type of activity for structure
    } else {
        type = getTaskType(task.id);
    }

    return {
        ...task,
        type: type,
        parentId: parentId,
        dependencies: getDependencies(task.id),
        isCritical: false, // Default value
    };
});

function calculateCriticalPath(tasks: Task[]): Task[] {
  const taskMap = new Map(tasks.map(task => [task.id, { ...task }]));
  const taskCalculations = new Map<string, { es: number; ef: number; ls: number; lf: number; slack: number; duration: number }>();

  // Initialize calculations
  tasks.forEach(task => {
    const duration = differenceInDays(parseISO(task.endDate), parseISO(task.startDate)) || 1;
    taskCalculations.set(task.id, {
      es: 0,
      ef: 0,
      ls: Infinity,
      lf: Infinity,
      slack: 0,
      duration,
    });
  });

  // Forward pass: Calculate Early Start (ES) and Early Finish (EF)
  tasks.forEach(task => {
    const calc = taskCalculations.get(task.id)!;
    if (task.dependencies.length === 0) {
      calc.es = 0;
    } else {
      const maxEF = Math.max(...task.dependencies.map(depId => taskCalculations.get(depId)?.ef || 0));
      calc.es = maxEF;
    }
    calc.ef = calc.es + calc.duration;
  });

  // Find project end date
  const projectEndDate = Math.max(...Array.from(taskCalculations.values()).map(c => c.ef));

  // Backward pass: Calculate Late Start (LS) and Late Finish (LF)
  const reversedTasks = [...tasks].reverse();
  reversedTasks.forEach(task => {
    const calc = taskCalculations.get(task.id)!;
    const successors = tasks.filter(t => t.dependencies.includes(task.id));

    if (successors.length === 0) {
      calc.lf = projectEndDate;
    } else {
      const minLS = Math.min(...successors.map(s => taskCalculations.get(s.id)?.ls || Infinity));
      calc.lf = minLS;
    }
    calc.ls = calc.lf - calc.duration;
    calc.slack = calc.ls - calc.es;
  });

  // Mark critical tasks
  const criticalPathTasks = new Set<string>();
  taskCalculations.forEach((calc, taskId) => {
    if (calc.slack <= 0) {
      criticalPathTasks.add(taskId);
    }
  });

  return tasks.map(task => {
      const isCritical = criticalPathTasks.has(task.id);
      let currentTask = task;
      let parentId = currentTask.parentId;
      let isChildOfCritical = false;

      // Check if any ancestor is critical
      while(parentId) {
          if (criticalPathTasks.has(parentId)) {
              isChildOfCritical = true;
              break;
          }
          const parentTask = taskMap.get(parentId);
          parentId = parentTask?.parentId;
      }
      
      // A task is marked as critical if it is on the path OR if its parent is.
      // This helps in styling the summary bars correctly.
      return {
          ...task,
          isCritical: isCritical || isChildOfCritical,
      }
  });
}


const tasksWithCriticalPath = calculateCriticalPath(baseTasks);

const taskMap = new Map(tasksWithCriticalPath.map(task => [task.id, task]));
const sortedTasks: Task[] = [];
const visited = new Set<string>();

function visit(taskId: string) {
    if (visited.has(taskId) || !taskMap.has(taskId)) return;
    visited.add(taskId);
    
    const task = taskMap.get(taskId);
    if (!task) return;

    sortedTasks.push(task);

    const children = tasksWithCriticalPath
      .filter(t => t.parentId === taskId)
      .sort((a, b) => a.id.localeCompare(b.id));

    children.forEach(child => visit(child.id));
}

const rootNodes = tasksWithCriticalPath.filter(task => task.type === 'EPS').sort((a,b) => a.id.localeCompare(b.id));
rootNodes.forEach(root => visit(root.id));

export const tasks: Task[] = sortedTasks;
