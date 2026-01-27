import { API_URL } from '../utils/constants';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/token`,
  REGISTER: `${API_URL}/register`,
  VERIFY_EMAIL: `${API_URL}/verify_email`,
  FORGOT_PASSWORD_OTP: `${API_URL}/send_forgot_password_otp`,
  FORGOT_PASSWORD: `${API_URL}/forgot_password`,
  RESET_PASSWORD: `${API_URL}/reset_password`,
  DELETE_ACCOUNT: `${API_URL}/delete_account`,

  // User
  USER_XP: `${API_URL}/user/xp`,

  // Tasks
  TASKS: `${API_URL}/tasks`,
  TASK_BY_TITLE: (title: string) => `${API_URL}/tasks/${title}`,
  TASK_BY_ID: (id: number) => `${API_URL}/tasks/${id}`,

  // Pets
  PETS_LIST: `${API_URL}/pet`,
  PETS_CREATE: `${API_URL}/pets`,
  PET_BY_ID: (id: number) => `${API_URL}/pet/${id}`,
  FEED_PET: (id: number) => `${API_URL}/pet/feed/${id}`,

  // Stats
  STATS: (userId: number, period: string) => `${API_URL}/stats/${userId}/${period}`,
} as const;

