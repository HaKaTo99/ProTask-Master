"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { suggestTaskAssignee } from "@/ai/flows/suggest-task-assignee";
import type { TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Loader2, User, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  suggestedAssignee?: string;
  reasoning?: string;
  error?: string;
} | null;

const initialState: FormState = null;

function AiAssignerAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const taskDescription = formData.get("taskDescription") as string;
  const availableAssignees = JSON.parse(
    formData.get("availableAssignees") as string
  );

  if (!taskDescription) {
    return Promise.resolve({ error: "Task description cannot be empty." });
  }

  return suggestTaskAssignee({ taskDescription, availableAssignees });
}

export default function AssignerForm({ teamMembers }: { teamMembers: TeamMember[] }) {
  const [state, formAction] = useFormState(AiAssignerAction, initialState);
  const [taskDescription, setTaskDescription] = useState("");
  const { toast } = useToast();

  if (state?.error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: state.error,
    });
  }

  const suggestedMember = teamMembers.find(m => m.name === state?.suggestedAssignee);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <form action={formAction} className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              Provide a clear and concise description of the task.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="taskDescription"
              placeholder="e.g., 'Implement a real-time notification system using WebSockets and Node.js...'"
              rows={6}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
              className="text-base"
            />
            <input
              type="hidden"
              name="availableAssignees"
              value={JSON.stringify(
                teamMembers.map(({ name, skills, currentWorkload }) => ({
                  name,
                  skills,
                  currentWorkload,
                }))
              )}
            />
          </CardContent>
        </Card>
        
        <SubmitButton />

      </form>

      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="text-primary"/> AI Suggestion</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] flex items-center justify-center">
            {state?.suggestedAssignee && suggestedMember ? (
              <div className="text-center space-y-4 w-full">
                 <Avatar className="h-20 w-20 mx-auto border-2 border-primary">
                  <AvatarImage src={suggestedMember.avatarUrl} alt={suggestedMember.name} />
                  <AvatarFallback>{suggestedMember.name.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-muted-foreground text-sm">Suggested Assignee</p>
                  <p className="font-bold text-xl font-headline">{state.suggestedAssignee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Reasoning</p>
                  <p className="text-sm">{state.reasoning}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">The AI's suggestion will appear here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Thinking...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Get Suggestion
        </>
      )}
    </Button>
  );
}
