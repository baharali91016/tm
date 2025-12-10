import { APIEndpoints } from "@/constants/api-endpoints";
import { QueryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type CreateTaskForm = z.infer<typeof createTaskSchema>;

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["todo", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  createdAt: z.string(),
});

const schema = z.object({
  task: taskSchema,
});

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateTaskForm) => {
      const { data } = await api.post(APIEndpoints.Tasks, formData);
      return schema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Tasks] });
    },
  });
};
