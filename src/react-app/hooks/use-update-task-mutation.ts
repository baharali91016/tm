import { APIEndpoints } from "@/constants/api-endpoints";
import { QueryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";

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

export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type UpdateTaskForm = z.infer<typeof updateTaskSchema>;

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: UpdateTaskForm) => {
      const { id, ...updateData } = formData;
      const { data } = await api.patch(
        `${APIEndpoints.Tasks}/${id}`,
        updateData
      );
      return schema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Tasks] });
    },
  });
};
