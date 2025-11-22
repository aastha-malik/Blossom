export const API_URL = "http://localhost:8000";

// TASKS
export async function fetchTasks(token?: string) {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

// CREATE a new task
export async function createTask(title: string, priority: string, token?: string) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title, priority }),
  });
  if (!res.ok) {
    throw new Error("Failed to create task");
  }
  return res.json();

}

//  UPDATE task's completed status
export async function updateTaskCompleted(id: number, completed: boolean, token?: string|null) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) {
    throw new Error("Failed to update task");
  }
  return res.json();

}

//  DELETE a task
export async function deleteTask(id: number, token?: string) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error("Failed to delete task");
  }
  return res.json();
}

// PETS

// Define a Pet interface if not already present
export interface Pet {
  id: number;
  name: string;
  type: string;
  hunger: number;
  is_alive: boolean;
  age: number;
  last_fed: string;
  user_id: number;
}

export async function fetchPets(token?: string) {
  const res = await fetch(`${API_URL}/pet`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch pets");
  return res.json();
}

export async function createPet(name: string, type: string, token?: string): Promise<Pet> {
  const res = await fetch(`${API_URL}/pets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, type }),
  });

  if (!res.ok) {
    throw new Error("Failed to create pet");
  }

  const data: Pet = await res.json();
  return data;
}

export async function feedPet(id: number, token?: string | null) {
  const res = await fetch(`${API_URL}/pets/${id}/feed`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to feed pet");
  return res.json();
}

// AUTH
export async function login(username: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(`${API_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function register(username: string, password: string, email: string) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

// STATS
export async function fetchStats(userId: number, period: "all_time" | "today" | "week" | "month" | "year", token?: string) {
  const res = await fetch(`${API_URL}/stats/${userId}/${period}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

