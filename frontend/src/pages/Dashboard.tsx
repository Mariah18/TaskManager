import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { tasksApi } from "../services/api";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import { GetTasksParams, Task } from "../types";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<GetTasksParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const queryClient = useQueryClient();
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const {
    data: tasksData,
    isLoading,
    error,
  } = useQuery(["tasks", filters], () => tasksApi.getTasks(filters));

  const createTaskMutation = useMutation(tasksApi.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["allTasks"]);
      setShowTaskForm(false);
      toast.success("Task created successfully!");
    },
    onError: () => {
      toast.error("Failed to create task.");
    },
  });

  const updateTaskMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => tasksApi.updateTask(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tasks"]);
        queryClient.invalidateQueries(["allTasks"]);
        toast.success("Task updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update task.");
      },
    }
  );

  const deleteTaskMutation = useMutation(tasksApi.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["allTasks"]);
      toast.success("Task deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete task.");
    },
  });

  const toggleCompleteMutation = useMutation(tasksApi.toggleComplete, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      queryClient.invalidateQueries(["allTasks"]);
      toast.success("Task completion status updated!");
    },
    onError: () => {
      toast.error("Failed to update completion status.");
    },
  });

  const handleCreateTask = (taskData: {
    title: string;
    description?: string;
  }) => {
    createTaskMutation.mutate(taskData);
  };

  const handleUpdateTask = (id: string, data: any) => {
    updateTaskMutation.mutate({ id, data });
  };

  const handleDeleteTask = (id: string) => {
    setDeleteTaskId(id);
  };

  const handleToggleComplete = (id: string) => {
    toggleCompleteMutation.mutate(id);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFiltersChange = (newFilters: Partial<GetTasksParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Helper to check if a date is today
  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  // Helper to check if a date is overdue
  const isOverdue = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    // Ignore time, just compare date
    return date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  // Fetch all tasks for announcements (ignore pagination/filters)
  const { data: allTasksData, isLoading: isLoadingAllTasks } = useQuery(
    ["allTasks"],
    () => tasksApi.getTasks({ limit: 1000 })
  );

  // Use paginated/filtered tasks for main display
  const allTasks = allTasksData?.data?.tasks || [];
  const paginatedTasks = tasksData?.data?.tasks || [];

  const dueTodayTasks = allTasks.filter(
    (t: Task) => t.dueDate && isToday(t.dueDate)
  );
  const overdueTasks = allTasks.filter(
    (t: Task) => t.dueDate && isOverdue(t.dueDate) && !t.completed
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading tasks. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={() => {
          if (deleteTaskId) deleteTaskMutation.mutate(deleteTaskId);
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
      {/* Announcements */}
      {dueTodayTasks.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg shadow-sm mb-2">
          <span className="text-2xl">📅</span>
          <div>
            <div className="font-semibold text-yellow-700 mb-1">
              Tasks due today:{" "}
              <span className="font-bold">{dueTodayTasks.length}</span>
            </div>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              {dueTodayTasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="hover:underline hover:text-yellow-900 cursor-pointer transition-colors"
                >
                  {task.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {overdueTasks.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-lg shadow-sm mb-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold text-red-700 mb-1">
              Overdue tasks:{" "}
              <span className="font-bold">{overdueTasks.length}</span>
            </div>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              {overdueTasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="hover:underline hover:text-red-900 cursor-pointer transition-colors"
                >
                  {task.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <button
          onClick={() => setShowTaskForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add New Task
        </button>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Task List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <TaskList
          tasks={paginatedTasks}
          pagination={tasksData?.data?.pagination}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onPageChange={handlePageChange}
          loading={
            updateTaskMutation.isLoading ||
            deleteTaskMutation.isLoading ||
            toggleCompleteMutation.isLoading
          }
        />
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
          loading={createTaskMutation.isLoading}
        />
      )}
    </div>
  );
};

export default Dashboard;
