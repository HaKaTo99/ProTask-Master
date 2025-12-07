import KanbanBoard from "@/components/kanban/kanban-board";

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full p-4 md:p-8">
       <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Kanban Board</h1>
        <p className="text-muted-foreground">
          Visualize your workflow and manage tasks with drag-and-drop simplicity.
        </p>
      </header>
      <div className="flex-1 overflow-x-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
