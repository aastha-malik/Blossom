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
  id: number;
  title: string;
  description?: string | null;
  priority?: string | null;
  completed: boolean;
  created_at: string;
  user_id: number;
  xpReward?: number | null;
  userXP?: number | null;
}

export interface TaskCreate {
  title: string;
  priority?: string;
}

export interface TaskCompletionUpdate {
  completed: boolean;
}

// Pet Types
export interface Pet {
  id: number;
  name: string;
  type: string;
  age: number;
  hunger: number;
  last_fed: string;
  is_alive: boolean;
  user_id: number;
}

export interface PetCreate {
  name: string;
  type: string;
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

