
import { TeamMember, Task } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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


export const tasks: Task[] = [
  // EPS
  { id: 'eps-amdal', title: 'Proyek AMDAL Pembangunan Pabrik', description: 'Studi Analisis Mengenai Dampak Lingkungan untuk rencana pembangunan pabrik.', status: 'To Do', priority: 'Urgent', startDate: '2025-07-01T00:00:00.000Z', endDate: '2025-12-20T00:00:00.000Z', dependencies: [], type: 'EPS' },

  // WBS 1: Persiapan dan Kerangka Acuan
  { id: 'wbs-1', parentId: 'eps-amdal', title: '1.0 Tahap Persiapan & Penyusunan Kerangka Acuan (KA)', description: 'Fase awal meliputi persiapan administrasi, tim, dan penyusunan dokumen KA.', status: 'To Do', priority: 'High', startDate: '2025-07-01T00:00:00.000Z', endDate: '2025-07-31T00:00:00.000Z', dependencies: [], type: 'WBS' },
  { id: 'act-1.1', parentId: 'wbs-1', title: '1.1 Kick-off Meeting dan Pembentukan Tim', description: 'Rapat awal dengan semua pemangku kepentingan dan pembentukan tim studi.', status: 'To Do', priority: 'High', assigneeId: 'user-3', startDate: '2025-07-01T09:00:00.000Z', endDate: '2025-07-03T17:00:00.000Z', dependencies: [], type: 'Activity' },
  { id: 'act-1.2', parentId: 'wbs-1', title: '1.2 Pengumpulan Data Sekunder & Studi Pustaka', description: 'Mengumpulkan data awal, peta, dan regulasi yang relevan.', status: 'To Do', priority: 'Medium', assigneeId: 'user-2', startDate: '2025-07-04T09:00:00.000Z', endDate: '2025-07-11T17:00:00.000Z', dependencies: [{ id: 'act-1.1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-1.3', parentId: 'wbs-1', title: '1.3 Penyusunan Draft Kerangka Acuan (KA)', description: 'Menyusun dokumen Kerangka Acuan untuk lingkup studi AMDAL.', status: 'To Do', priority: 'High', assigneeId: 'user-5', startDate: '2025-07-14T09:00:00.000Z', endDate: '2025-07-25T17:00:00.000Z', dependencies: [{ id: 'act-1.2', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'milestone-1', parentId: 'wbs-1', title: 'Persetujuan Kerangka Acuan (KA)', description: 'Mendapatkan persetujuan resmi atas dokumen KA dari komisi penilai.', status: 'To Do', priority: 'Urgent', startDate: '2025-07-31T17:00:00.000Z', endDate: '2025-07-31T17:00:00.000Z', dependencies: [{ id: 'act-1.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },

  // WBS 2: Pengumpulan Data Primer
  { id: 'wbs-2', parentId: 'eps-amdal', title: '2.0 Tahap Pengumpulan Data Primer', description: 'Survei dan pengambilan sampel di lokasi proyek.', status: 'To Do', priority: 'High', startDate: '2025-08-01T00:00:00.000Z', endDate: '2025-08-29T00:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'WBS' },
  { id: 'act-2.1', parentId: 'wbs-2', title: '2.1 Survei Komponen Geofisika-Kimia', description: 'Pengambilan sampel air, udara, dan tanah.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-08-01T09:00:00.000Z', endDate: '2025-08-15T17:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-2.2', parentId: 'wbs-2', title: '2.2 Survei Komponen Biologi', description: 'Inventarisasi flora dan fauna di sekitar lokasi proyek.', status: 'To Do', priority: 'High', assigneeId: 'user-1', startDate: '2025-08-04T09:00:00.000Z', endDate: '2025-08-18T17:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-2.3', parentId: 'wbs-2', title: '2.3 Survei Sosial, Ekonomi, dan Budaya', description: 'Wawancara dengan masyarakat dan pemangku kepentingan.', status: 'To Do', priority: 'High', assigneeId: 'user-3', startDate: '2025-08-11T09:00:00.000Z', endDate: '2025-08-29T17:00:00.000Z', dependencies: [{ id: 'milestone-1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },

  // WBS 3: Analisis dan Evaluasi Dampak
  { id: 'wbs-3', parentId: 'eps-amdal', title: '3.0 Analisis Data & Evaluasi Dampak', description: 'Analisis data laboratorium dan evaluasi potensi dampak penting.', status: 'To Do', priority: 'High', startDate: '2025-09-01T00:00:00.000Z', endDate: '2025-10-17T00:00:00.000Z', dependencies: [{ id: 'act-2.1', type: 'Finish-to-Start', lag: 0 }, { id: 'act-2.2', type: 'Finish-to-Start', lag: 0 }, { id: 'act-2.3', type: 'Finish-to-Start', lag: 0 }], type: 'WBS' },
  { id: 'act-3.1', parentId: 'wbs-3', title: '3.1 Analisis Laboratorium Sampel', description: 'Analisis hasil sampel air, udara, dan tanah di laboratorium.', status: 'To Do', priority: 'High', assigneeId: 'user-2', startDate: '2025-09-01T09:00:00.000Z', endDate: '2025-09-19T17:00:00.000Z', dependencies: [{ id: 'act-2.1', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-3.2', parentId: 'wbs-3', title: '3.2 Prakiraan & Evaluasi Dampak Penting', description: 'Menganalisis dan mengevaluasi besaran dan sifat dampak.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-5', startDate: '2025-09-22T09:00:00.000Z', endDate: '2025-10-10T17:00:00.000Z', dependencies: [{ id: 'act-3.1', type: 'Finish-to-Start', lag: 0 }, { id: 'act-2.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-3.3', parentId: 'wbs-3', title: '3.3 Evaluasi Holistik Dampak', description: 'Evaluasi dampak secara keseluruhan sebagai satu kesatuan.', status: 'To Do', priority: 'High', assigneeId: 'user-3', startDate: '2025-10-13T09:00:00.000Z', endDate: '2025-10-17T17:00:00.000Z', dependencies: [{ id: 'act-3.2', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  
  // WBS 4: Penyusunan Laporan dan Finalisasi
  { id: 'wbs-4', parentId: 'eps-amdal', title: '4.0 Penyusunan Laporan & Finalisasi', description: 'Menyusun dokumen ANDAL, RKL, dan RPL serta asistensi.', status: 'To Do', priority: 'Urgent', startDate: '2025-10-20T00:00:00.000Z', endDate: '2025-12-20T00:00:00.000Z', dependencies: [{ id: 'act-3.3', type: 'Finish-to-Start', lag: 0 }], type: 'WBS' },
  { id: 'act-4.1', parentId: 'wbs-4', title: '4.1 Penyusunan Draft Dokumen ANDAL', description: 'Menyusun laporan Analisis Dampak Lingkungan.', status: 'To Do', priority: 'High', assigneeId: 'user-5', startDate: '2025-10-20T09:00:00.000Z', endDate: '2025-11-14T17:00:00.000Z', dependencies: [{ id: 'act-3.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-4.2', parentId: 'wbs-4', title: '4.2 Penyusunan Draft RKL-RPL', description: 'Menyusun Rencana Pengelolaan dan Pemantauan Lingkungan.', status: 'To Do', priority: 'High', assigneeId: 'user-4', startDate: '2025-10-27T09:00:00.000Z', endDate: '2025-11-21T17:00:00.000Z', dependencies: [{ id: 'act-3.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'act-4.3', parentId: 'wbs-4', title: '4.3 Asistensi & Pembahasan Laporan', description: 'Pembahasan draft laporan dengan komisi penilai AMDAL.', status: 'To Do', priority: 'Urgent', assigneeId: 'user-3', startDate: '2025-11-24T09:00:00.000Z', endDate: '2025-12-12T17:00:00.000Z', dependencies: [{ id: 'act-4.1', type: 'Finish-to-Start', lag: 0 }, { id: 'act-4.2', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
  { id: 'milestone-2', parentId: 'wbs-4', title: 'Penyerahan Laporan Final', description: 'Penyerahan dokumen final ANDAL dan RKL-RPL yang telah direvisi.', status: 'To Do', priority: 'Urgent', startDate: '2025-12-19T17:00:00.000Z', endDate: '2025-12-19T17:00:00.000Z', dependencies: [{ id: 'act-4.3', type: 'Finish-to-Start', lag: 0 }], type: 'Activity' },
];
