export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  completed?: boolean;
  search?: string;
  sortBy?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
