import { API_ENDPOINTS } from './endpoints';
import type { 
  LoginRequest, 
  TokenResponse, 
  RegisterRequest,
  Task,
  TaskCreate,
  TaskCompletionUpdate,
  Pet,
  PetCreate,
  UserStats,
  UserXP
} from './types';

// Get token from auth context (will be passed as parameter)
type GetTokenFn = () => string | null;

let getToken: GetTokenFn = () => null;

export const setTokenGetter = (fn: GetTokenFn) => {
  getToken = fn;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    // Handle 404 for empty task list (backend returns 404 when no tasks found)
    if (response.status === 404) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json().catch(() => ({ detail: 'Not found' }));
        // If it's a tasks endpoint and returns 404, return empty array
        if (response.url.includes('/tasks') && error.detail === 'No tasks found') {
          return [] as T;
        }
        throw new Error(error.detail || 'Not found');
      }
      // For tasks endpoint, return empty array on 404
      if (response.url.includes('/tasks')) {
        return [] as T;
      }
      throw new Error('Not found');
    }
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    return handleResponse<TokenResponse>(response);
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<{ message: string }>(response);
  },

  verifyEmail: async (email: string, verificationToken: string): Promise<{ message: string }> => {
    const response = await fetch(API_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, verification_token: verificationToken }),
    });

    return handleResponse<{ message: string }>(response);
  },

  sendForgotPasswordOTP: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_ENDPOINTS.FORGOT_PASSWORD_OTP}?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    return handleResponse<{ message: string }>(response);
  },

  forgotPassword: async (
    enteredVerifyCode: string,
    username: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<{ message: string }> => {
    const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        entered_verify_code: enteredVerifyCode,
        username,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }),
    });

    return handleResponse<{ message: string }>(response);
  },

  resetPassword: async (
    username: string,
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<{ message: string }> => {
    const response = await fetch(`${API_ENDPOINTS.RESET_PASSWORD}?new_password=${encodeURIComponent(newPassword)}&new_password_confirm=${encodeURIComponent(newPasswordConfirm)}&old_password=${encodeURIComponent(oldPassword)}&username=${encodeURIComponent(username)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    return handleResponse<{ message: string }>(response);
  },

  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await fetch(API_ENDPOINTS.DELETE_ACCOUNT, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    return handleResponse<{ message: string }>(response);
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (): Promise<Task[]> => {
    const response = await fetch(API_ENDPOINTS.TASKS, {
      headers: getAuthHeaders(),
    });

    return handleResponse<Task[]>(response);
  },

  create: async (data: TaskCreate): Promise<Task> => {
    const response = await fetch(API_ENDPOINTS.TASKS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<Task>(response);
  },

  update: async (title: string): Promise<Task> => {
    const response = await fetch(API_ENDPOINTS.TASK_BY_TITLE(title), {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    return handleResponse<Task>(response);
  },

  updateCompletion: async (taskId: number, completed: boolean): Promise<Task> => {
    const response = await fetch(API_ENDPOINTS.TASK_BY_ID(taskId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed }),
    });

    return handleResponse<Task>(response);
  },

  delete: async (taskId: number): Promise<{ message: string }> => {
    const response = await fetch(API_ENDPOINTS.TASK_BY_ID(taskId), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse<{ message: string }>(response);
  },
};

// Pets API
export const petsAPI = {
  getAll: async (): Promise<Pet[]> => {
    const response = await fetch(API_ENDPOINTS.PETS, {
      headers: getAuthHeaders(),
    });

    return handleResponse<Pet[]>(response);
  },

  create: async (data: PetCreate): Promise<Pet> => {
    const response = await fetch(API_ENDPOINTS.PETS.replace('/pet', '/pets'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<Pet>(response);
  },

  feed: async (petId: number): Promise<Pet> => {
    const response = await fetch(API_ENDPOINTS.FEED_PET(petId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    return handleResponse<Pet>(response);
  },

  delete: async (petId: number): Promise<{ message: string }> => {
    const response = await fetch(API_ENDPOINTS.PET_BY_ID(petId), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse<{ message: string }>(response);
  },
};

// Stats API
export const statsAPI = {
  getStats: async (userId: number, period: string): Promise<UserStats> => {
    const response = await fetch(API_ENDPOINTS.STATS(userId, period), {
      headers: getAuthHeaders(),
    });

    return handleResponse<UserStats>(response);
  },
};

// User API
export const userAPI = {
  getXP: async (): Promise<UserXP> => {
    const response = await fetch(API_ENDPOINTS.USER_XP, {
      headers: getAuthHeaders(),
    });

    return handleResponse<UserXP>(response);
  },
};

