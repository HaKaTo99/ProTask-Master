"use client";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BarChartHorizontal,
  Trello,
  GitMerge,
  CalendarDays,
  CheckSquare,
  Bot,
  PanelLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gantt", label: "Gantt Chart", icon: BarChartHorizontal },
  { href: "/kanban", label: "Kanban Board", icon: Trello },
  { href: "/pert", label: "PERT Diagram", icon: GitMerge },
  { href: "/scheduler", label: "Scheduler", icon: CalendarDays },
  { href: "/todo", label: "To-Do List", icon: CheckSquare },
  { href: "/ai-assigner", label: "AI Assigner", icon: Bot },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-9 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
              <PanelLeft className="size-5" />
            </Button>
            <h1 className="text-xl font-bold text-sidebar-foreground font-headline">ProTask Master</h1>
          </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
