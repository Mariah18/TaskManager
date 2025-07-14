import axios, { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common["Authorization"];
    }
  }

  // Auth API
  async login(data: { email: string; password: string }) {
    return this.api.post("/auth/login", data);
  }

  async register(data: { email: string; password: string; name?: string }) {
    return this.api.post("/auth/register", data);
  }

  // Tasks API
  async getTasks(params?: {
    page?: number;
    limit?: number;
    completed?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return this.api.get("/tasks", { params });
  }

  async getTask(id: string) {
    return this.api.get(`/tasks/${id}`);
  }

  async createTask(data: { title: string; description?: string }) {
    return this.api.post("/tasks", data);
  }

  async updateTask(id: string, data: { title?: string; description?: string }) {
    return this.api.patch(`/tasks/${id}`, data);
  }

  async deleteTask(id: string) {
    return this.api.delete(`/tasks/${id}`);
  }

  async toggleTaskComplete(id: string) {
    return this.api.patch(`/tasks/${id}/complete`);
  }
}

export const apiService = new ApiService();

// Export specific API instances for better organization
export const authApi = {
  login: apiService.login.bind(apiService),
  register: apiService.register.bind(apiService),
  setToken: apiService.setToken.bind(apiService),
};

export const tasksApi = {
  getTasks: apiService.getTasks.bind(apiService),
  getTask: apiService.getTask.bind(apiService),
  createTask: apiService.createTask.bind(apiService),
  updateTask: apiService.updateTask.bind(apiService),
  deleteTask: apiService.deleteTask.bind(apiService),
  toggleComplete: apiService.toggleTaskComplete.bind(apiService),
};
