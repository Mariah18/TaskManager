import React, { useState } from "react";
import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  loading?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onDelete,
  onToggleComplete,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    priority: task.priority || "low",
  });
  const [error, setError] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editData.title.trim() || !editData.dueDate) {
      setError("Due date is required.");
      return;
    }
    setError("");
    onUpdate(task.id, {
      ...editData,
      dueDate: editData.dueDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      priority: task.priority || "low",
    });
    setIsEditing(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className={`flex items-start justify-between bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-150 mb-2
        ${
          task.priority === "high"
            ? "border-l-8 border-red-200"
            : task.priority === "medium"
            ? "border-l-8 border-yellow-200"
            : "border-l-8 border-blue-200"
        }
        ${task.completed ? "opacity-70" : "hover:shadow-md"}
        hover:bg-gray-50`}
    >
      {isEditing ? (
        <div className="flex-1 space-y-3">
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-semibold text-lg"
            placeholder="Task title"
          />
          <textarea
            name="description"
            value={editData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Task description (optional)"
          />
          <input
            type="date"
            name="dueDate"
            value={editData.dueDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <select
            name="priority"
            value={editData.priority}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleSave}
              disabled={loading || !editData.title.trim()}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                disabled={loading}
                className="h-5 w-5 text-green-500 focus:ring-green-400 border-gray-300 rounded cursor-pointer transition-colors"
              />
              <h3
                className={`text-lg font-semibold ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`ml-2 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${
                  task.priority === "high"
                    ? "bg-red-50 text-red-700"
                    : task.priority === "medium"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p
                className={`mt-1 text-sm ${
                  task.completed ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {task.description}
              </p>
            )}
            {task.dueDate && (
              <p className="text-xs text-blue-500 mt-2">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={handleEdit}
              disabled={loading}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 rounded transition-colors disabled:opacity-50 border border-primary-100 hover:border-primary-300"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              disabled={loading}
              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded transition-colors disabled:opacity-50 border border-red-100 hover:border-red-300"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;
