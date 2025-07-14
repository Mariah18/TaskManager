import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { tasksApi } from "../services/api";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import { GetTasksParams } from "../types";

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<GetTasksParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: tasksData,
    isLoading,
    error,
  } = useQuery(["tasks", filters], () => tasksApi.getTasks(filters));

  const createTaskMutation = useMutation(tasksApi.createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      setShowTaskForm(false);
    },
  });

  const updateTaskMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => tasksApi.updateTask(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tasks"]);
      },
    }
  );

  const deleteTaskMutation = useMutation(tasksApi.deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
    },
  });

  const toggleCompleteMutation = useMutation(tasksApi.toggleComplete, {
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
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
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading tasks. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          tasks={tasksData?.data?.tasks || []}
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
