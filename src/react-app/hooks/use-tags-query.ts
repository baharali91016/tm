import { APIEndpoints } from "@/constants/api-endpoints";
import { QueryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import z from "zod";

const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

const schema = z.object({
  tags: z.array(tagSchema),
});

export const useTagsQuery = () => {
  return useQuery({
    queryKey: [QueryKeys.Tags],
    queryFn: async () => {
      const { data } = await api.get(APIEndpoints.Tags);
      return schema.parse(data);
    },
  });
};
