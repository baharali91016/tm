import { APIEndpoints } from "@/constants/api-endpoints";
import { QueryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
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
  tasks: z.array(taskSchema),
});

export const useTasksQuery = () => {
  return useQuery({
    queryKey: [QueryKeys.Tasks],
    queryFn: async () => {
      const { data } = await api.get(APIEndpoints.Tasks);
      return schema.parse(data);
    },
  });
};
