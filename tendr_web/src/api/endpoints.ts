import { API_URL } from '../utils/constants';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/login`,
  REGISTER: `${API_URL}/signup`,
  VERIFY_EMAIL: `${API_URL}/verify_email`,
  FORGOT_PASSWORD_OTP: `${API_URL}/send_forgot_password_otp`,
  FORGOT_PASSWORD: `${API_URL}/forgot_password`,
  RESET_PASSWORD: `${API_URL}/reset_password`,
  DELETE_ACCOUNT: `${API_URL}/delete_account`,
  GOOGLE_COMPLETE_REGISTRATION: `${API_URL}/auth/google/complete-registration`,
  DELETE_ACCOUNT_OTP: `${API_URL}/delete_account_otp`,

  // User
  USER_XP: `${API_URL}/user/xp`,
  USER_THEME: `${API_URL}/user/theme`,
  USER_PROVIDER: `${API_URL}/user/provider`,

  // Tasks
  TASKS: `${API_URL}/tasks`,
  TASK_BY_TITLE: (title: string) => `${API_URL}/tasks/${title}`,
  TASK_BY_ID: (id: string) => `${API_URL}/tasks/${id}`,

  // Pets
  PETS_LIST: `${API_URL}/pet`,
  PETS_CREATE: `${API_URL}/pets`,
  PET_BY_ID: (id: string) => `${API_URL}/pet/${id}`,
  FEED_PET: (id: string) => `${API_URL}/pet/feed/${id}`,

  // Stats
  STATS: (userId: string) => `${API_URL}/analysis/${userId}`,

  // Focus
  FOCUS_SESSION: `${API_URL}/focus/session`,
  FOCUS_TOTAL: `${API_URL}/focus/total`,
} as const;

