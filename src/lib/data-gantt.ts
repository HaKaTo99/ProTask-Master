import { TeamMember, Task } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// This file is now a legacy file. 
// The data has been moved to the component's state in `src/app/(tools)/gantt/page.tsx`.
// It is kept here for reference or potential future use if needed.

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


export const tasks: Task[] = [];

    