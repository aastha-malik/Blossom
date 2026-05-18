// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  category?: string | null;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
  due_date?: string | null;
  user_id: string;
  points?: number | null;
  xpReward?: number | null;
  userXP?: number | null;
}

export interface TaskCreate {
  title: string;
  priority?: string;
  category?: string;
  due_date?: string | null;
}

export interface TaskCompletionUpdate {
  completed: boolean;
}

// Pet Types
export interface Pet {
  id: string;
  name: string;
  type: string;
  gender?: string | null;
  age: number;
  hunger: number;
  last_fed: string;
  is_alive: boolean;
  bond: number | null;
  last_focused_at: string | null;
  user_id: string;
}

export interface PetCreate {
  name: string;
  type: string;
  gender?: string | null;
}

// Stats Types
export interface UserStats {
  num_task_completed: number;
  streaks: number;
  xps: number;
}

// User Types
export interface UserXP {
  xp: number;
}

// Focus Types
export interface FocusTotal {
  total_seconds: number;
}

