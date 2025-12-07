import { teamMembers } from "@/lib/data";
import AssignerForm from "@/components/ai-assigner/assigner-form";

export default function AiAssignerPage() {
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold font-headline">AI Task Assigner</h1>
        <p className="text-muted-foreground mt-2">
          Leverage AI to find the perfect person for the job. Describe the task, and our assistant will suggest the best-suited team member based on their skills and current workload.
        </p>
      </header>
      
      <AssignerForm teamMembers={teamMembers} />
    </div>
  );
}
