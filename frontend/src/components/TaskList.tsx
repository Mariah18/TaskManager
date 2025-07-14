import React from "react";
import TaskItem from "./TaskItem";
import { Task, Pagination } from "../types";

interface TaskListProps {
  tasks: Task[];
  pagination?: Pagination;
  onUpdateTask: (id: string, data: any) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  pagination,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onPageChange,
  loading = false,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No tasks found. Create your first task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task Items */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onToggleComplete={onToggleComplete}
            loading={loading}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-3 py-2 text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Task Count */}
      {pagination && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} tasks
        </div>
      )}
    </div>
  );
};

export default TaskList;
