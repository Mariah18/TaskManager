import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { tasksApi } from "../services/api";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import { GetTasksParams, Task } from "../types";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

// Dashboard page displays the user's tasks and provides controls for managing them
const Dashboard: React.FC = () => {
  // State for tasks, filters, and UI
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filters, setFilters] = useState<GetTasksParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
  });
  const queryClient = useQueryClient();

  // Fetch all tasks for announcements (ignore pagination/filters)
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allTasksLoading, setAllTasksLoading] = useState(false);

  useEffect(() => {
    setAllTasksLoading(true);
    tasksApi
      .getTasks({ limit: 1000 })
      .then((res) => setAllTasks(res.data.tasks))
      .finally(() => setAllTasksLoading(false));
  }, []);

  // Fetch tasks from the API when filters change
  useEffect(() => {
    setLoading(true);
    tasksApi
      .getTasks(filters)
      .then((res) => setTasks(res.data.tasks))
      .finally(() => setLoading(false));
  }, [filters]);

  // Handle creating a new task
  const handleCreate = (taskData: { title: string; description?: string }) => {
    setLoading(true);
    tasksApi
      .createTask(taskData)
      .then((res) => {
        const newTask = res.data;
        setTasks((prev) => [newTask, ...prev]);
        setShowForm(false);
        toast.success("Task created successfully!");
      })
      .catch(() => toast.error("Failed to create task."))
      .finally(() => setLoading(false));
  };

  // Handle editing an existing task
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Handle updating a task
  const handleUpdate = (id: string, data: any) => {
    if (!editingTask) return;
    setLoading(true);
    tasksApi
      .updateTask(id, data)
      .then((res) => {
        const updated = res.data;
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        toast.success("Task updated successfully!");
      })
      .catch(() => toast.error("Failed to update task."))
      .finally(() => {
        setShowForm(false);
        setEditingTask(null);
        setLoading(false);
      });
  };

  // Handle deleting a task (with confirmation)
  const handleDelete = (id: string) => {
    setTaskToDelete(tasks.find((t) => t.id === id) || null);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;
    setLoading(true);
    tasksApi
      .deleteTask(taskToDelete.id)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
        toast.success("Task deleted successfully!");
      })
      .catch(() => toast.error("Failed to delete task."))
      .finally(() => {
        setShowConfirm(false);
        setTaskToDelete(null);
        setLoading(false);
      });
  };

  // Handle toggling task completion
  const handleToggleComplete = (id: string) => {
    setLoading(true);
    tasksApi
      .toggleComplete(id)
      .then((res) => {
        const updated = res.data;
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        toast.success("Task completion status updated!");
      })
      .catch(() => toast.error("Failed to update completion status."))
      .finally(() => setLoading(false));
  };

  // Handle filter changes
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

  // Use allTasks for announcements
  const dueTodayTasks = allTasks.filter(
    (t: Task) => t.dueDate && isToday(t.dueDate)
  );
  const overdueTasks = allTasks.filter(
    (t: Task) => t.dueDate && isOverdue(t.dueDate) && !t.completed
  );

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!taskToDelete}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
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
          onClick={() => {
            setShowForm(true);
            setEditingTask(null);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add New Task
        </button>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onUpdateTask={handleUpdate}
          onDeleteTask={handleDelete}
          onToggleComplete={handleToggleComplete}
          onPageChange={(page: number) =>
            setFilters((prev) => ({ ...prev, page }))
          }
          loading={loading}
        />
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          initialTask={editingTask || {}}
          onSubmit={(task: Partial<Task>) => {
            if (editingTask) {
              handleUpdate(editingTask.id, task);
            } else {
              handleCreate(task as { title: string; description?: string });
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
