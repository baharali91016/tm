import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  createTaskSchema,
  useCreateTaskMutation,
  type CreateTaskForm,
} from "@/hooks/use-create-task-mutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateTaskFormProps {
  onSuccess: () => void;
}

export function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const { mutate, isPending } = useCreateTaskMutation();

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Task created successfully");
        form.reset();
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to create task");
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => <Input {...field} placeholder="Title" />}
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      <div>
        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Textarea {...field} placeholder="Description (optional)" />
          )}
        />
      </div>
      <div>
        <Label htmlFor="priority">Priority</Label>
        <Controller
          name="priority"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
