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
import { useTagsQuery } from "@/hooks/use-tags-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { QueryKeys } from "@/constants/query-keys";
import { APIEndpoints } from "@/constants/api-endpoints";

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
      tags: [],
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
      <div>
        <Label>Tags</Label>
        <TagsSelector form={form} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}

function TagsSelector({ form }: { form: UseFormReturn<any> }) {
  const { data, isPending } = useTagsQuery();
  const [tagName, setTagName] = useState("");
  const queryClient = useQueryClient();
  const tags = data?.tags ?? [];

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post(APIEndpoints.Tags, { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Tags] });
      setTagName("");
      toast.success("Tag created successfully");
    },
    onError: () => {
      toast.error("Failed to create tag");
    },
  });

  const values: string[] = form.getValues("tags") ?? [];

  const handleCreateTag = () => {
    if (tagName.trim()) {
      createTagMutation.mutate(tagName.trim());
    }
  };

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Loading tags...</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((t) => {
            const checked = values.includes(t.id);
            return (
              <label key={t.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  value={t.id}
                  checked={checked}
                  onChange={(e) => {
                    const selected = form.getValues("tags") ?? [];
                    if (e.target.checked) form.setValue("tags", [...selected, t.id]);
                    else form.setValue("tags", selected.filter((id: string) => id !== t.id));
                  }}
                />
                <span className="text-sm">{t.name}</span>
              </label>
            );
          })}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            placeholder="New tag name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            disabled={createTagMutation.isPending}
            className="h-8"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCreateTag}
          disabled={!tagName.trim() || createTagMutation.isPending}
        >
          {createTagMutation.isPending ? "Adding..." : "Add Tag"}
        </Button>
      </div>
    </div>
  );
}
