import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  BarChartHorizontal,
  Trello,
  GitMerge,
  CalendarDays,
  CheckSquare,
  Bot,
} from "lucide-react";
import Link from "next/link";

const tools = [
  {
    title: "Gantt Chart",
    description: "Visualisasikan linimasa proyek Anda.",
    icon: BarChartHorizontal,
    href: "/gantt",
    color: "text-blue-500",
  },
  {
    title: "Kanban Board",
    description: "Kelola tugas dengan papan seret dan lepas.",
    icon: Trello,
    href: "/kanban",
    color: "text-purple-500",
  },
  {
    title: "PERT Diagram",
    description: "Lihat dependensi tugas dan jalur kritis.",
    icon: GitMerge,
    href: "/pert",
    color: "text-green-500",
  },
  {
    title: "Scheduler",
    description: "Rencanakan pekerjaan dengan kalender interaktif.",
    icon: CalendarDays,
    href: "/scheduler",
    color: "text-yellow-500",
  },
  {
    title: "To-Do List",
    description: "Lacak tugas dalam tampilan daftar yang detail.",
    icon: CheckSquare,
    href: "/todo",
    color: "text-red-500",
  },
  {
    title: "AI Assigner",
    description: "Dapatkan saran penugasan tugas dari AI.",
    icon: Bot,
    href: "/ai-assigner",
    color: "text-cyan-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-4xl font-bold font-headline">Developer's Project Toolkit</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Kumpulan alat manajemen proyek yang siap pakai untuk aplikasi Anda berikutnya. Setiap alat di bawah ini menunjukkan komponen fungsional yang dapat Anda jelajahi.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.title} className="group">
            <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold font-headline">{tool.title}</CardTitle>
                <tool.icon className={`h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors ${tool.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
