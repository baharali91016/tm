import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLoader,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { APIEndpoints } from "@/constants/api-endpoints";
import { QueryKeys } from "@/constants/query-keys";
import { useDeleteTaskMutation } from "@/hooks/use-delete-task-mutation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTasksQuery } from "@/hooks/use-tasks-query";
import { useTagsQuery } from "@/hooks/use-tags-query";
import { useUpdateTaskMutation } from "@/hooks/use-update-task-mutation";
import { api } from "@/lib/api";
import { FormEvent, useEffect, useState } from "react";

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["todo", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.object({ id: z.string(), name: z.string() })),
  createdAt: z.string(),
});

export type Task = z.infer<typeof taskSchema>;

function getStatusDisplay(status: Task["status"]) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        icon: (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ),
      };
    case "in_progress":
      return {
        label: "In Progress",
        icon: <IconLoader className="animate-spin" />,
      };
    case "todo":
      return { label: "To Do", icon: <IconLoader /> };
    default:
      return { label: status, icon: null };
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TaskCellViewer({ task }: { task: Task }) {
  const isMobile = useIsMobile();
  const updateMutation = useUpdateTaskMutation();
  const { data: tagsData, isLoading: tagsLoading, error: tagsError } = useTagsQuery();
  const [tagName, setTagName] = useState("");
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    task.tags.map((t) => t.id) || []
  );
  const [open, setOpen] = useState(false);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.promise(
      updateMutation
        .mutateAsync({
          id: task.id,
          title,
          description,
          status,
          priority,
          tags: selectedTags,
        })
        .then(() => setOpen(false)),
      {
        loading: "Updating task...",
        success: "Task updated successfully",
        error: "Failed to update task",
      }
    );
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {task.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit Task</DrawerTitle>
          <DrawerDescription>
            Make changes to your task here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Task["status"])}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Task["priority"])}
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Tags</Label>
              <div className="flex flex-col gap-2">
                {tagsLoading ? (
                  <span className="text-sm text-muted-foreground">Loading tags...</span>
                ) : tagsError ? (
                  <span className="text-sm text-red-500">Error: {String(tagsError)}</span>
                ) : tagsData?.tags && tagsData.tags.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {tagsData.tags.map((tag) => {
                      const checked = selectedTags.includes(tag.id);
                      return (
                        <label key={tag.id} className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={tag.id}
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag.id]);
                              } else {
                                setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                              }
                            }}
                          />
                          <span>{tag.name}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No tags yet</span>
                )}
                <div className="flex gap-2 items-center pt-2 border-t">
                  <Input
                    placeholder="New tag name"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (tagName.trim()) {
                          createTagMutation.mutate(tagName.trim());
                        }
                      }
                    }}
                    disabled={createTagMutation.isPending}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (tagName.trim()) {
                        createTagMutation.mutate(tagName.trim());
                      }
                    }}
                    disabled={createTagMutation.isPending || !tagName.trim()}
                  >
                    {createTagMutation.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Created At</Label>
              <div className="text-muted-foreground">
                {formatDate(task.createdAt)}
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ActionsCell({ task }: { task: Task }) {
  const isMobile = useIsMobile();
  const deleteMutation = useDeleteTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const { data: tagsData, isLoading: tagsLoading, error: tagsError } = useTagsQuery();
  const [tagName, setTagName] = useState("");
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    task.tags.map((t) => t.id) || []
  );
  const [open, setOpen] = useState(false);

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

  const handleDelete = () => {
    toast.promise(deleteMutation.mutateAsync(task.id), {
      loading: "Deleting task...",
      success: "Task deleted successfully",
      error: "Failed to delete task",
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.promise(
      updateMutation
        .mutateAsync({
          id: task.id,
          title,
          description,
          status,
          priority,
          tags: selectedTags,
        })
        .then(() => setOpen(false)),
      {
        loading: "Updating task...",
        success: "Task updated successfully",
        error: "Failed to update task",
      }
    );
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DrawerTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </DrawerTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit Task</DrawerTitle>
          <DrawerDescription>
            Make changes to your task here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor={`edit-title-${task.id}`}>Title</Label>
              <Input
                id={`edit-title-${task.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor={`edit-description-${task.id}`}>Description</Label>
              <Textarea
                id={`edit-description-${task.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor={`edit-status-${task.id}`}>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Task["status"])}
              >
                <SelectTrigger id={`edit-status-${task.id}`} className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor={`edit-priority-${task.id}`}>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Task["priority"])}
              >
                <SelectTrigger id={`edit-priority-${task.id}`} className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Tags</Label>
              <div className="flex flex-col gap-2">
                {tagsLoading ? (
                  <span className="text-sm text-muted-foreground">Loading tags...</span>
                ) : tagsError ? (
                  <span className="text-sm text-red-500">Error: {String(tagsError)}</span>
                ) : tagsData?.tags && tagsData.tags.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {tagsData.tags.map((tag) => {
                      const checked = selectedTags.includes(tag.id);
                      return (
                        <label key={tag.id} className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={tag.id}
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag.id]);
                              } else {
                                setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                              }
                            }}
                          />
                          <span>{tag.name}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No tags yet</span>
                )}
                <div className="flex gap-2 items-center pt-2 border-t">
                  <Input
                    placeholder="New tag name"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (tagName.trim()) {
                          createTagMutation.mutate(tagName.trim());
                        }
                      }
                    }}
                    disabled={createTagMutation.isPending}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (tagName.trim()) {
                        createTagMutation.mutate(tagName.trim());
                      }
                    }}
                    disabled={createTagMutation.isPending || !tagName.trim()}
                  >
                    {createTagMutation.isPending ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Created At</Label>
              <div className="text-muted-foreground">
                {formatDate(task.createdAt)}
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function StatusCell({ task }: { task: Task }) {
  const updateMutation = useUpdateTaskMutation();
  const statusDisplay = getStatusDisplay(task.status);

  const handleStatusChange = (newStatus: Task["status"]) => {
    toast.promise(
      updateMutation.mutateAsync({
        id: task.id,
        status: newStatus,
      }),
      {
        loading: "Updating status...",
        success: "Status updated",
        error: "Failed to update status",
      }
    );
  };

  return (
    <Select value={task.status} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[140px] h-8 border-transparent bg-transparent hover:bg-input/30">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {statusDisplay.icon}
          {statusDisplay.label}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todo">To Do</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  );
}

function getPriorityDisplay(priority: Task["priority"]) {
  switch (priority) {
    case "high":
      return {
        label: "High",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    case "medium":
      return {
        label: "Medium",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
    case "low":
      return {
        label: "Low",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    default:
      return {
        label: priority,
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      };
  }
}

function PriorityCell({ task }: { task: Task }) {
  const updateMutation = useUpdateTaskMutation();
  const priorityDisplay = getPriorityDisplay(task.priority);

  const handlePriorityChange = (newPriority: Task["priority"]) => {
    toast.promise(
      updateMutation.mutateAsync({
        id: task.id,
        priority: newPriority,
      }),
      {
        loading: "Updating priority...",
        success: "Priority updated",
        error: "Failed to update priority",
      }
    );
  };

  return (
    <Select value={task.priority} onValueChange={handlePriorityChange}>
      <SelectTrigger className="w-[120px] h-8 border-transparent bg-transparent hover:bg-input/30">
        <Badge className={`${priorityDisplay.className} px-1.5`}>
          {priorityDisplay.label}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">Low</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="high">High</SelectItem>
      </SelectContent>
    </Select>
  );
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <TaskCellViewer task={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-muted-foreground">
        {row.original.description || "No description"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell task={row.original} />,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityCell task={row.original} />,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap">
        {row.original.tags && row.original.tags.length > 0 ? (
          row.original.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell task={row.original} />,
  },
];

export function DataTable() {
  const { data, isPending, isError } = useTasksQuery();
  const { data: tagsData } = useTagsQuery();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Filter tasks by selected tag if one is selected
  const filteredTasks = selectedTagId && selectedTagId !== "all"
    ? tasks.filter((t) => t.tags.some((tag) => tag.id === selectedTagId))
    : tasks;

  useEffect(() => {
    if (data?.tasks) {
      setTasks(data.tasks);
    }
  }, [data]);

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Error loading tasks. Please try again.
        </div>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Label htmlFor="tag-filter" className="text-sm font-medium">
            Filter by Tag:
          </Label>
          <Select value={selectedTagId} onValueChange={setSelectedTagId}>
            <SelectTrigger className="w-[180px]" id="tag-filter" size="sm">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tagsData?.tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select defaultValue="outline">
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outline">All Tasks</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="outline">All Tasks</TabsTrigger>
            <TabsTrigger value="todo">
              To Do{" "}
              <Badge variant="secondary">
                {tasks.filter((t) => t.status === "todo").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress{" "}
              <Badge variant="secondary">
                {tasks.filter((t) => t.status === "in_progress").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed{" "}
              <Badge variant="secondary">
                {tasks.filter((t) => t.status === "completed").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} task(s) total.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="todo"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.filter((t) => t.status === "todo").length > 0 ? (
                tasks
                  .filter((t) => t.status === "todo")
                  .map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <TaskCellViewer task={task} />
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {task.description || "No description"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(task.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ActionsCell task={task} />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No pending tasks.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent
        value="in-progress"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.filter((t) => t.status === "in_progress").length > 0 ? (
                tasks
                  .filter((t) => t.status === "in_progress")
                  .map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <TaskCellViewer task={task} />
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {task.description || "No description"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(task.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ActionsCell task={task} />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No tasks in progress.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent
        value="completed"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.filter((t) => t.status === "completed").length > 0 ? (
                tasks
                  .filter((t) => t.status === "completed")
                  .map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <TaskCellViewer task={task} />
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {task.description || "No description"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(task.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ActionsCell task={task} />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No completed tasks.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
