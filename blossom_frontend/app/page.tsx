"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fetchTasks, createTask, updateTaskCompleted, deleteTask, fetchPets, createPet, login, register, fetchStats, API_URL } from "../lib/api";

interface Pet {
  id: string;
  name: string;
  type: "dog" | "cat";
  ageInYears: number;
  stage: "baby" | "young" | "adult" | "elder";
  hunger: number; // 0-100, 0 = starving, 100 = full
  happiness: number; // 0-100
  health: number; // 0-100
  lastFed: string; // ISO date string
  daysSinceLastFed: number;
  isAlive: boolean;
  birthDate: string;
  totalFoodEaten: number;
  level: number; // Pet's own level based on care
}

interface UserData {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  tasks: Task[];
  completedTasks: number;
  focusSessions: number;
  totalFocusTime: number;
  coins: number;
  powerUps: string[];
  isLoggedIn: boolean;
  username?: string;
  email?: string;
  pets: Pet[];
  activePetId?: string;
}

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  created: string;
  xpReward: number;
}

export default function BlossomFocusPreview() {
  const [currentPage, setCurrentPage] = useState("focus");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [userData, setUserData] = useState<UserData>({
    level: 1,
    xp: 100,
    xpToNext: 300,
    streak: 0,
    tasks: [],
    completedTasks: 0,
    focusSessions: 0,
    totalFocusTime: 0,
    coins: 0,
    powerUps: [],
    isLoggedIn: false,
    pets: [],
    activePetId: "1",
  });

  const [newTask, setNewTask] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [timerSeconds, setTimerSeconds] = useState(1500);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusNote, setFocusNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showPetCreator, setShowPetCreator] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState<"dog" | "cat">("dog");
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"all" | "year" | "month" | "week" | "today">("all");

  const [authToken, setAuthToken] = useState<string | null>(null);

  const [verifyEmailToken, setVerifyEmailToken] = useState("");
  const [resetPasswordForm, setResetPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  console.log("showPetCreator:", showPetCreator);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  // Update pet status every hour
  useEffect(() => {
    const updatePetStatus = () => {
      setUserData((prev) => ({
        ...prev,
        pets: prev.pets.map((pet) => {
          if (!pet.isAlive) return pet;

          const now = new Date();
          const lastFed = new Date(pet.lastFed);
          const daysSinceLastFed = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60 * 60 * 24));

          const newHunger = Math.max(0, pet.hunger - daysSinceLastFed * 15);
          let newHealth = pet.health;
          let newHappiness = pet.happiness;
          let isAlive = pet.isAlive;

          if (newHunger < 30) {
            newHealth = Math.max(0, newHealth - daysSinceLastFed * 10);
            newHappiness = Math.max(0, newHappiness - daysSinceLastFed * 20);
          }

          if (daysSinceLastFed >= 7) {
            isAlive = false;
            newHealth = 0;
            newHappiness = 0;
          }

          return {
            ...pet,
            daysSinceLastFed,
            hunger: newHunger,
            health: newHealth,
            happiness: newHappiness,
            isAlive,
          };
        }),
      }));
    };

    updatePetStatus();
    const interval = setInterval(updatePetStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
      if (focusedTaskId) {
        completeTask(focusedTaskId);
        setFocusedTaskId(null);
      }
      setTimerSeconds(1500);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Fetch tasks from backend on login
  useEffect(() => {
    if (userData.isLoggedIn && authToken) {
      fetchTasks(authToken)
        .then((tasks) => {
          setUserData((prev) => ({ ...prev, tasks }));
        })
        .catch((err) => console.error("Failed to fetch tasks:", err));
    }
  }, [userData.isLoggedIn, authToken]);

  const gainXP = (amount: number) => {
    setXpGainAmount(amount);
    setShowXpGain(true);
    setUserData((prev) => ({
      ...prev,
      xp: prev.xp + amount,
      coins: prev.coins + Math.floor(amount / 5),
    }));
    setTimeout(() => setShowXpGain(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(1500);
  };

  const getActivePet = (): Pet | undefined => {
    return userData.pets.find((pet) => pet.id === userData.activePetId);
  };

  const getPetStageInfo = (ageInYears: number) => {
    if (ageInYears < 1) {
      return { stage: "baby", foodCost: 50, size: "text-8xl", description: "Tiny & Adorable" };
    } else if (ageInYears < 5) {
      return { stage: "young", foodCost: 50, size: "text-9xl", description: "Growing & Playful" };
    } else if (ageInYears < 10) {
      return { stage: "adult", foodCost: 50, size: "text-[10rem]", description: "Strong & Mature" };
    } else {
      return { stage: "elder", foodCost: 50, size: "text-[12rem]", description: "Wise & Majestic" };
    }
  };

  const getPetEmoji = (pet: Pet) => {
    if (!pet.isAlive) return pet.type === "dog" ? "💀🐕" : "💀🐱";

    const stageInfo = getPetStageInfo(pet.ageInYears);

    if (pet.type === "dog") {
      switch (stageInfo.stage) {
        case "baby":
          return "🐶";
        case "young":
          return "🐕";
        case "adult":
          return "🐕‍🦺";
        case "elder":
          return "🦮";
        default:
          return "🐕";
      }
    } else {
      switch (stageInfo.stage) {
        case "baby":
          return "🐱";
        case "young":
          return "🐈";
        case "adult":
          return "🐈‍⬛";
        case "elder":
          return "🦁";
        default:
          return "🐱";
      }
    }
  };

  const feedPet = (petId: string, useStreak = false) => {
    const pet = userData.pets.find((p) => p.id === petId);
    if (!pet) return;

    const stageInfo = getPetStageInfo(pet.ageInYears);
    const foodCost = stageInfo.foodCost;
    const streakCost = 1;

    if (useStreak && userData.streak < streakCost) {
      alert("Not enough streak days! You need at least 1 streak day.");
      return;
    }

    if (!useStreak && userData.xp < foodCost) {
      alert(`Not enough XP! You need ${foodCost} XP to feed a ${stageInfo.stage} pet.`);
      return;
    }

    setUserData((prev) => ({
      ...prev,
      xp: useStreak ? prev.xp : prev.xp - foodCost,
      streak: useStreak ? prev.streak - streakCost : prev.streak,
      pets: prev.pets.map((p) => {
        if (p.id === petId) {
          const newHunger = Math.min(100, p.hunger + 40);
          const newHappiness = Math.min(100, p.happiness + 20);
          const newHealth = Math.min(100, p.health + 10);
          const newLevel = Math.floor(p.totalFoodEaten / 10) + 1;
          const newAge = Math.min(15, p.ageInYears + 0.1); // Slight age increase with feeding

          return {
            ...p,
            hunger: newHunger,
            happiness: newHappiness,
            health: newHealth,
            lastFed: new Date().toISOString(),
            daysSinceLastFed: 0,
            totalFoodEaten: p.totalFoodEaten + 1,
            level: newLevel,
            ageInYears: newAge,
            stage: getPetStageInfo(newAge).stage as "baby" | "young" | "adult" | "elder",
          };
        }
        return p;
      }),
    }));

    gainXP(useStreak ? 0 : 10);
    alert(`🍖 Fed ${pet.name}! They're much happier now! ${useStreak ? "(Used 1 streak day)" : `(-${foodCost} XP)`}`);
  };

  
  const createPet = async () => {
    if (!newPetName.trim()) {
      alert("Please enter a name for your pet!");
      return;
    }
  
    if (!authToken) {
      alert("You must be logged in to adopt a pet!");
      return;
    }
  
    try {
      const createdPet = await createPet(newPetName.trim(), newPetType, authToken);
    
      setUserData((prev) => ({
        ...prev,
        pets: [...prev.pets, createdPet],
        activePetId: createdPet.id,
      }));
    
      setNewPetName("");
      setShowPetCreator(false);
      alert(`🎉 Welcome ${createdPet.name}! Your new ${createdPet.type} is ready to grow with you!`);
    } catch (err) {
      alert("Failed to adopt pet");
    }
    
  };
  
    
  const handleFeedPet = async (petId: number, petName: string) => {
    if (!authToken) return;
  
    //  Check XP before feeding
    if (userData.xp < 35) {
      alert("You need at least 35 XP to feed your pet!");
      return;
    }
  
    try {
      const res = await feedPet(petId, authToken);
      console.log("Feed success:", res);
  
      // 🎉 Show Thank You popup
      alert(`Thank you, ${userData.username}! You just fed ${petName}! 🐾`);
  
      // Update pet + deduct XP
      setUserData((prev) => ({
        ...prev,
        xp: prev.xp - 35,
        pets: prev.pets.map((p) =>
          p.id === petId
            ? {
                ...p,
                hunger: res.hunger ?? 100,
                last_fed: res.last_fed,
                is_alive: res.is_alive,
              }
            : p
        ),
      }));
    } catch (err) {
      console.error("Feed failed:", err);
      alert("Failed to feed pet");
    }
  };
  

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === "signup") {
        if (authForm.password !== authForm.confirmPassword) {
          alert("Passwords don't match!");
          return;
        }
        if (!authForm.username || !authForm.email || !authForm.password) {
          alert("Please fill in all fields!");
          return;
        }
        const res = await register(authForm.username, authForm.password, authForm.email);
        setAuthToken(res.access_token || null);
        setUserData((prev) => ({ ...prev, isLoggedIn: true, username: authForm.username, email: authForm.email }));
      } else {
        if (!authForm.username && !authForm.email) {
          alert("Please enter username or email!");
          return;
        }
        if (!authForm.password) {
          alert("Please enter password!");
          return;
        }
        const res = await login(authForm.username, authForm.password);
        setAuthToken(res.access_token || null);
        setUserData((prev) => ({ ...prev, isLoggedIn: true, username: authForm.username, email: authForm.email }));
      }
      setShowAuthModal(false);
      setAuthForm({ username: "", email: "", password: "", confirmPassword: "" });
      gainXP(authMode === "signup" ? 50 : 25);
      setTimeout(() => {
        alert(authMode === "signup" ? "🎉 Welcome to Blossom Focus! +50 XP Bonus!" : "✨ Welcome back! +25 XP Bonus!");
      }, 500);
    } catch (err) {
      alert("Authentication failed");
    }
  };

  const handleLogout = () => {
    setUserData((prev) => ({
      ...prev,
      isLoggedIn: false,
      username: undefined,
      email: undefined,
    }));
  };

  const handleVerifyEmail = async () => {
    try {
      await fetch(`${API_URL}/verify_email?email=${userData.email}&verification_token=${verifyEmailToken}`, { method: "POST" });
      alert("Email verified!");
      setVerifyEmailToken("");
    } catch {
      alert("Email verification failed");
    }
  };

  const handleResetPassword = async () => {
    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      await fetch(`${API_URL}/reset_password?new_password=${resetPasswordForm.newPassword}&new_password_confirm=${resetPasswordForm.confirmNewPassword}&old_password=${resetPasswordForm.oldPassword}&username=${userData.username}`, { method: "PATCH" });
      alert("Password reset successful!");
      setResetPasswordForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch {
      alert("Password reset failed");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API_URL}/delete_user?username=${userData.username}`, { method: "DELETE" });
      alert("Account deleted!");
      setShowDeleteDialog(false);
      handleLogout();
    } catch {
      alert("Account deletion failed");
    }
  };

  const addTask = async () => {
    if (!newTask.trim() || !authToken) return;
    try {
      const created = await createTask(newTask, taskPriority, authToken);
      setUserData((prev) => ({ ...prev, tasks: [...prev.tasks, created] }));
      setNewTask("");
    } catch (err) {
      alert("Failed to add task");
    }
  };

  const completeTask = async (taskId: string) => {
    if (!authToken) return;
    try {
      const res = await updateTaskCompleted(Number(taskId), true, authToken);
      console.log("Task completion response:", res);
      console.log("User XP:", res.userXP);
      // res will contain: { id, title, completed, xpReward, userXP, ... }
  
      setUserData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
        completedTasks: prev.completedTasks + 1,
        xp: res.userXP, // ✅ directly use updated XP from backend
      }));
    } catch (err) {
      alert("Failed to complete task");
    }
  };
  

  const deleteTaskHandler = async (taskId: string) => {
    if (!authToken) return;
    try {
      await deleteTask(Number(taskId), authToken);
      setUserData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const navItems = [
    { id: "focus", label: "Task & Focus", color: "from-[#B967FF] to-[#FF2D95]", icon: "⏰" },
    { id: "pets", label: "My Pets", color: "from-[#FF2D95] to-[#00E0FF]", icon: "🐾" },
    { id: "analytics", label: "Analytics", color: "from-[#00E0FF] to-[#FF2D95]", icon: "📊" },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#18181A] text-white overflow-hidden relative">
        {/* XP Gain Animation */}
        {showXpGain && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-[#FF2D95] to-[#00E0FF] text-white px-8 py-4 rounded-full text-2xl font-bold shadow-2xl">
              +{xpGainAmount} XP! 🌟
            </div>
          </div>
        )}
        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl bg-black/90 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                <div className="relative z-10">
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-4 right-4 text-white hover:text-[#FF2D95] text-4xl font-extrabold transition-colors duration-300"
                    aria-label="Close"
                  >
                    ✕
                  </button>

                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-[#FF2D95] via-[#00E0FF] to-[#B967FF] bg-clip-text text-transparent mb-2">
                      {authMode === "login" ? "🌸 WELCOME BACK" : "🌸 JOIN US"}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {authMode === "login"
                        ? "Sign in to sync your progress across devices!"
                        : "Create an account to save your productivity journey!"}
                    </p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">
                        Username {authMode === "login" && <span className="text-[#00E0FF]">(or Email)</span>}
                      </label>
                      <Input
                        type="text"
                        value={authForm.username}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder={authMode === "login" ? "Enter username or email" : "Choose a username"}
                        className="bg-black/70 border-2 border-[#FF2D95]/50 text-white placeholder:text-white/50 focus:border-[#00E0FF] focus:ring-[#00E0FF]/20"
                      />
                    </div>

                    {authMode === "signup" && (
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Email</label>
                        <Input
                          type="email"
                          value={authForm.email}
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          className="bg-black/70 border-2 border-[#FF2D95]/50 text-white placeholder:text-white/50 focus:border-[#00E0FF] focus:ring-[#00E0FF]/20"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Password</label>
                      <Input
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        className="bg-black/70 border-2 border-[#FF2D95]/50 text-white placeholder:text-white/50 focus:border-[#00E0FF] focus:ring-[#00E0FF]/20"
                      />
                    </div>

                    {authMode === "signup" && (
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">Confirm Password</label>
                        <Input
                          type="password"
                          value={authForm.confirmPassword}
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your password"
                          className="bg-black/70 border-2 border-[#FF2D95]/50 text-white placeholder:text-white/50 focus:border-[#00E0FF] focus:ring-[#00E0FF]/20"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-105 py-6 text-xl font-black rounded-2xl text-white animate-gradient-move"
                    >
                      {authMode === "login" ? "🚀 SIGN IN" : "✨ CREATE ACCOUNT"}
                    </Button>
                  </form>

                  <div className="text-center mt-6">
                    <p className="text-white/60 text-sm mb-2">
                      {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                      onClick={() => {
                        setAuthMode(authMode === "login" ? "signup" : "login");
                        setAuthForm({ username: "", email: "", password: "", confirmPassword: "" });
                      }}
                      className="text-[#00E0FF] hover:text-[#FF2D95] font-bold transition-colors duration-300"
                    >
                      {authMode === "login" ? "Create Account" : "Sign In Instead"}
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <button
                      onClick={() => setShowAuthModal(false)}
                      className="text-white/40 hover:text-white/60 text-sm transition-colors duration-300"
                    >
                      Skip for now (Continue as guest)
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pet Creator Modal */}
        {showPetCreator && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl bg-black/90 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                <div className="relative z-10">
                  <button
                    onClick={() => setShowPetCreator(false)}
                    className="absolute top-0 right-0 text-white hover:text-[#FF2D95] text-2xl font-bold transition-colors duration-300"
                  >
                    ✕
                  </button>

                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-[#FF2D95] via-[#00E0FF] to-[#B967FF] bg-clip-text text-transparent mb-2">
                      🐾 ADOPT A PET
                    </h2>
                    <p className="text-white/80 text-sm">Choose your new companion to grow with your productivity!</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Pet Name</label>
                      <Input
                        type="text"
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        placeholder="Enter a cute name..."
                        className="bg-black/70 border-2 border-[#FF2D95]/50 text-white placeholder:text-white/50 focus:border-[#00E0FF] focus:ring-[#00E0FF]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white mb-4">Pet Type</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setNewPetType("dog")}
                          className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
                            newPetType === "dog"
                              ? "bg-gradient-to-r from-[#FF2D95] to-[#B967FF] border-[#FF2D95] text-white"
                              : "bg-black/50 border-[#FF2D95]/30 text-white hover:border-[#FF2D95]/50"
                          }`}
                        >
                          <div className="text-4xl mb-2">🐶</div>
                          <div className="font-bold">DOG</div>
                          <div className="text-xs text-white/80">Loyal & Energetic</div>
                        </button>
                        <button
                          onClick={() => setNewPetType("cat")}
                          className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
                            newPetType === "cat"
                              ? "bg-gradient-to-r from-[#00E0FF] to-[#B967FF] border-[#00E0FF] text-white"
                              : "bg-black/50 border-[#00E0FF]/30 text-white hover:border-[#00E0FF]/50"
                          }`}
                        >
                          <div className="text-4xl mb-2">🐱</div>
                          <div className="font-bold">CAT</div>
                          <div className="text-xs text-white/80">Independent & Wise</div>
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={createPet}
                      className="w-full bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-105 py-6 text-xl font-black rounded-2xl text-white animate-gradient-move"
                    >
                      🎉 ADOPT PET
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#FF2D95]/20 to-[#B967FF]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#00E0FF]/20 to-[#B967FF]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-[#B967FF]/15 to-[#FF2D95]/15 rounded-full blur-3xl animate-pulse delay-500"></div>

          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-[#FF2D95] to-[#00E0FF] rounded-full animate-ping"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: "2s",
              }}
            />
          ))}

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,45,149,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,224,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        <div className="relative z-10">
          {/* Top Header with Logo and Stats */}
          <div className="bg-black/90 backdrop-blur-2xl border-b border-[#FF2D95]/30 shadow-2xl shadow-[#FF2D95]/20">
            <div className="max-w-7xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center justify-center relative">
                  <span className="text-4xl font-black bg-gradient-to-r from-[#FF2D95] via-[#00E0FF] to-[#B967FF] bg-clip-text text-transparent drop-shadow-2xl animate-gradient-move">BLOSSOM</span>
                  <div className="w-40 h-2 bg-gradient-to-r from-[#FF2D95] to-[#00E0FF] rounded-full mx-auto mt-2"></div>
                </div>

                <div className="flex items-center gap-6">
                  {userData.isLoggedIn && (
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#00E0FF]">👋 {userData.username}</div>
                      <div className="text-xs text-white/60">{userData.email}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-black/40 rounded-lg px-4 py-2 border border-[#00E0FF]/30">
                    <span className="text-xl">⭐</span>
                    <span className="text-lg font-bold text-[#00E0FF]">{userData.xp} XP</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/40 rounded-lg px-4 py-2 border border-[#FF2D95]/30">
                    <span className="text-xl">🔥</span>
                    <span className="text-lg font-bold text-[#FF2D95]">{userData.streak}</span>
                  </div>

                  {getActivePet() && (
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg px-4 py-2 border border-[#B967FF]/30">
                      <span className="text-xl">{getPetEmoji(getActivePet()!)}</span>
                      <div className="text-sm">
                        <div className="font-bold text-[#B967FF]">{getActivePet()!.name}</div>
                        <div className="text-xs text-white/60">
                          {getActivePet()!.isAlive ? `${getActivePet()!.hunger}% fed` : "💀 RIP"}
                        </div>
                      </div>
                    </div>
                  )}

                  {userData.isLoggedIn ? (
                    <>
                      <Button
                        onClick={handleLogout}
                        className="bg-black/40 border border-[#00E0FF]/30 rounded-lg px-4 py-2 text-sm font-bold text-white hover:bg-black/60 hover:border-[#00E0FF]/50 transition-all duration-300"
                      >
                        🔒 Logout
                      </Button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-[#FF2D95] to-[#00E0FF] hover:shadow-lg hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-105 px-6 py-2 text-sm font-bold rounded-lg text-white animate-gradient-move"
                    >
                      🌟 Sign In / Sign Up
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-black/80 backdrop-blur-xl border-b border-[#FF2D95]/20">
            <div className="max-w-7xl mx-auto px-8">
              <nav className="flex gap-6 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`group px-10 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      currentPage === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-2xl shadow-[#FF2D95]/30 border border-white/30`
                        : "text-white bg-black/40 hover:bg-black/60 border border-[#FF2D95]/30 hover:border-[#FF2D95]/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                      <span className="tracking-wide text-white font-bold text-lg">{item.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-8 py-10">
            {currentPage === "focus" && (
              <>
                <div className="text-center mb-8 flex justify-center gap-2">
                  <h2 className="text-7xl font-black mb-2 bg-gradient-to-r from-orange-400 via-pink-500 to-teal-400 bg-clip-text text-white drop-shadow-2xl animate-gradient-move">
                    ⏰ TASK & FOCUS
                  </h2>
                </div>
                <div className="w-full">
                  <div className="flex flex-col md:flex-row gap-8 w-full">
                    {/* Focus Timer Section */}
                    <div className="flex-1">
                      <Card className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
                        <CardContent className="p-8 text-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                          <div className="relative z-10">
                            <div className="text-7xl font-black text-transparent bg-gradient-to-r from-[#00E0FF] via-[#B967FF] to-[#FF2D95] bg-clip-text mb-8 font-mono tracking-wider drop-shadow-2xl">
                              {formatTime(timerSeconds)}
                            </div>
                            {focusedTaskId ? (
                              <>
                                <div className="text-xl font-bold mb-2">
                                  <span className="text-cyan-400">Focusing:</span>
                                  <span className="ml-2 bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] bg-clip-text text-transparent font-extrabold">{userData.tasks.find(t => t.id === focusedTaskId)?.title}</span>
                                </div>
                                <div className="text-2xl font-bold text-[#00E0FF] mb-6">🌟 +{userData.tasks.find(t => t.id === focusedTaskId)?.xpReward} XP ON COMPLETION</div>
                              </>
                            ) : (
                              <div className="text-lg text-white/60 mt-4 mb-6">Generic Focus Session (no XP reward)</div>
                            )}
                            <div className="w-40 h-2 bg-gradient-to-r from-[#00E0FF] to-[#FF2D95] rounded-full mx-auto mb-4"></div>
                            <div className="flex justify-center gap-8 mt-8">
                              <Button
                                onClick={() => setTimerRunning(!timerRunning)}
                                className="bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-110 px-10 py-4 text-xl font-black rounded-2xl text-white animate-gradient-move"
                              >
                                {timerRunning ? "⏸️ PAUSE" : "🎯 START"}
                              </Button>
                              <Button
                                onClick={resetTimer}
                                className="bg-gradient-to-r from-[#00E0FF] via-[#B967FF] to-[#FF2D95] hover:shadow-2xl hover:shadow-[#00E0FF]/30 transition-all duration-300 transform hover:scale-110 px-10 py-4 text-xl font-black rounded-2xl text-white animate-gradient-move"
                              >
                                🔄 RESET
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Task Manager Section */}
                    <div className="flex-1">
                      <Card className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
                        <CardContent className="p-8 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                          <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] bg-clip-text text-transparent animate-gradient-move">
                              ➕ CREATE NEW TASK
                            </h3>
                            <div className="flex flex-wrap gap-6 items-end">
                              <div className="flex-1 min-w-80">
                                <Input
                                  value={newTask}
                                  onChange={(e) => setNewTask(e.target.value)}
                                  placeholder="What task awaits? ⚡"
                                  className="bg-black/70 border-2 border-[#FF2D95]/50 text-white text-lg p-4 rounded-xl backdrop-blur-sm focus:border-[#00E0FF] focus:ring-[#00E0FF]/20 transition-all duration-300 placeholder:text-white/50"
                                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                                />
                              </div>
                              <div className="flex gap-3">
                                {(["low", "medium", "high"] as const).map(priority => (
                                  <button
                                    key={priority}
                                    onClick={() => setTaskPriority(priority)}
                                    className={`px-8 py-4 rounded-xl text-sm font-black transition-all duration-300 transform hover:scale-105 border-2 ${
                                      taskPriority === priority
                                        ? priority === "high"
                                          ? "bg-gradient-to-r from-[#FF2D95] to-[#B967FF] text-white shadow-lg shadow-[#FF2D95]/30 border-[#FF2D95]"
                                          : priority === "medium"
                                            ? "bg-gradient-to-r from-[#B967FF] to-[#00E0FF] text-white shadow-lg shadow-[#B967FF]/30 border-[#B967FF]"
                                            : "bg-gradient-to-r from-[#00E0FF] to-[#FF2D95] text-white shadow-lg shadow-[#00E0FF]/30 border-[#00E0FF]"
                                        : "bg-black/50 text-white hover:bg-black/70 border-white/30"
                                    }`}
                                  >
                                    <div className="text-white font-bold">{priority.toUpperCase()}</div>
                                    <div className="text-xs text-white/80">
                                      +{priority === "high" ? "25" : priority === "medium" ? "15" : "10"} XP
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <Button
                                onClick={addTask}
                                className="bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-110 px-10 py-6 text-xl font-black rounded-2xl text-white animate-gradient-move"
                              >
                                CREATE TASK ⚡
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <div className="space-y-6 mt-8">
                        <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] bg-clip-text text-transparent animate-gradient-move">
                          🎮 ACTIVE TASKS
                        </h3>
                        {userData.tasks.length === 0 ? (
                          <Card className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl">
                            <CardContent className="p-12 text-center">
                              <div className="text-8xl mb-6">🎯</div>
                              <div className="text-[#00E0FF] text-2xl font-black mb-4">NO ACTIVE TASKS!</div>
                              <div className="text-white text-lg font-bold">
                                Create your first task above to start earning XP and leveling up!
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          userData.tasks.map((task, index) => (
                            <Card key={task.id} className="bg-black/70 border-2 border-[#FF2D95]/30 shadow-lg">
                              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1">
                                  <div className="text-xl font-bold text-white mb-2">{task.title}</div>
                                  <div className="text-sm text-[#FF2D95] font-bold mb-1">Priority: {String(task.priority).toUpperCase()}</div>
                                  <div className="text-xs text-white/60 mb-2">Created: {new Date(task.created).toLocaleString()}</div>
                                  <div className="text-sm text-[#00E0FF] font-bold">XP Reward: {task.xpReward}</div>
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => setFocusedTaskId(task.id)}
                                    className="bg-gradient-to-r from-[#00E0FF] to-[#FF2D95] text-white font-bold rounded-full px-6 py-2"
                                  >
                                    Focus
                                  </Button>
                                  <Button
                                    onClick={() => completeTask(task.id)}
                                    className="bg-gradient-to-r from-[#FF2D95] to-[#B967FF] text-white font-bold rounded-full px-6 py-2"
                                  >
                                    Complete
                                  </Button>
                                  <Button
                                    onClick={() => deleteTaskHandler(task.id)}
                                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-full px-6 py-2"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {currentPage === "pets" && (
              <div className="p-8 space-y-8 text-center">
                {/* Adopt a Pet Button */}
                <Button
                  onClick={() => setShowPetCreator(true)}
                  className="bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  🐾 Adopt a Pet
                </Button>

                {/* Pet Creator Modal */}
                {showPetCreator && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-xl bg-black/90 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
                      <CardContent className="p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                        <div className="relative z-10">
                          {/* Close button */}
                          <button
                            onClick={() => setShowPetCreator(false)}
                            className="absolute top-0 right-0 text-white hover:text-[#FF2D95] text-2xl font-bold transition-colors duration-300"
                          >
                            ✕
                          </button>

                          {/* Header */}
                          <div className="text-center mb-8">
                            <h2 className="text-4xl font-black bg-gradient-to-r from-[#FF2D95] via-[#00E0FF] to-[#B967FF] bg-clip-text text-transparent mb-2">
                              🐾 ADOPT A PET
                            </h2>
                            <p className="text-white/80 text-sm">
                              Choose your new companion to grow with your productivity!
                            </p>
                          </div>

                          {/* Form */}
                          <div className="space-y-6">
                            {/* Pet Name */}
                            <div>
                              <label className="block text-sm font-bold text-white mb-2">
                                Pet Name
                              </label>
                              <Input
                                type="text"
                                value={newPetName}
                                onChange={(e) => setNewPetName(e.target.value)}
                                placeholder="Enter a cute name..."
                                className="bg-black/70 border-2 border-[#FF2D95]/50 text-white placeholder:text-white/50 focus:border-[#00E0FF] focus:ring-[#00E0FF]/20"
                              />
                            </div>

                            {/* Pet Type */}
                            <div>
                              <label className="block text-sm font-bold text-white mb-4">
                                Pet Type
                              </label>
                              <div className="flex gap-4">
                                <button
                                  onClick={() => setNewPetType("dog")}
                                  className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
                                    newPetType === "dog"
                                      ? "bg-gradient-to-r from-[#FF2D95] to-[#B967FF] border-[#FF2D95] text-white"
                                      : "bg-black/50 border-[#FF2D95]/30 text-white hover:border-[#FF2D95]/50"
                                  }`}
                                >
                                  <div className="text-4xl mb-2">🐶</div>
                                  <div className="font-bold">DOG</div>
                                  <div className="text-xs text-white/80">Loyal & Energetic</div>
                                </button>
                                <button
                                  onClick={() => setNewPetType("cat")}
                                  className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
                                    newPetType === "cat"
                                      ? "bg-gradient-to-r from-[#00E0FF] to-[#B967FF] border-[#00E0FF] text-white"
                                      : "bg-black/50 border-[#00E0FF]/30 text-white hover:border-[#00E0FF]/50"
                                  }`}
                                >
                                  <div className="text-4xl mb-2">🐱</div>
                                  <div className="font-bold">CAT</div>
                                  <div className="text-xs text-white/80">Independent & Wise</div>
                                </button>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                              onClick={createPet}
                              className="w-full bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-105 py-6 text-xl font-black rounded-2xl text-white animate-gradient-move"
                            > 
                              🎉 ADOPT PET
                            </Button>
                            
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
            {/* 🐾 Adopted Pets List */}
              <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userData.pets && userData.pets.length > 0 ? (
                  userData.pets.map((pet) => (
                    <Card
                      key={pet.id}
                      className={`bg-black/70 border ${
                        pet.is_alive ? "border-[#FF2D95]/30" : "border-red-600/40"
                      } hover:border-[#00E0FF]/50 transition-all duration-300 backdrop-blur-md rounded-2xl shadow-xl`}
                    >
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                        <div className="text-6xl">
                          {pet.type === "dog"
                            ? pet.is_alive
                              ? "🐶"
                              : "💀🐶"
                            : pet.type === "cat"
                            ? pet.is_alive
                              ? "🐱"
                              : "💀🐱"
                            : "🐾"}
                        </div>

                        <h3 className="text-2xl font-bold text-white">{pet.name}</h3>
                        <p className="text-white/70 capitalize">{pet.type}</p>

                        {/* 🧓 Age Display */}
                        <p className="text-[#00E0FF] font-semibold">Age: {pet.age || 1} 🧁</p>

                        {/* 🍗 Hunger */}
                        {pet.is_alive ? (
                          <>
                            <p className="text-white/60 text-sm">
                              Hunger: {pet.hunger}% | Last fed:{" "}
                              {pet.last_fed
                                ? new Date(pet.last_fed).toLocaleDateString()
                                : "Never"}
                            </p>

                            <Button
                              onClick={() => handleFeedPet(pet.id, pet.name)}
                              className="mt-3 bg-gradient-to-r from-[#00E0FF] to-[#B967FF] px-6 py-2 rounded-xl text-white hover:scale-105 transition-all"
                            >
                              🍗 Feed (−35 XP)
                            </Button>
                          </>
                        ) : (
                          <p className="text-red-500 font-bold text-lg">
                            💀 {pet.name} hasn’t been fed for {pet.days_since_fed || "7+"} days
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-white/60 text-lg mt-4 col-span-full">
                    You haven't adopted any pets yet! 🥺
                  </p>
                )}
              </div>

            {/* Other pages remain the same... */}
            {currentPage === "analytics" && (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-[#00E0FF] via-[#FF2D95] to-[#B967FF] bg-clip-text text-white drop-shadow-2xl animate-gradient-move">
                    📊 PLAYER STATS
                  </h2>
                  <p className="text-white text-xl font-bold">Track your journey to productivity mastery!</p>
                </div>

                {/* Period Selection Tabs */}
                <div className="flex justify-center gap-4 mb-8 w-full">
                  <Button
                    onClick={() => setAnalyticsPeriod('all')}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      analyticsPeriod === 'all'
                        ? 'bg-gradient-to-r from-[#FF2D95] to-[#B967FF] text-white shadow-2xl shadow-[#FF2D95]/30 border border-white/30'
                        : 'text-white bg-black/40 hover:bg-black/60 border border-[#FF2D95]/30 hover:border-[#FF2D95]/50'
                    }`}
                  >
                    All Time
                  </Button>
                  <Button
                    onClick={() => setAnalyticsPeriod('year')}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      analyticsPeriod === 'year'
                        ? 'bg-gradient-to-r from-[#FF2D95] to-[#B967FF] text-white shadow-2xl shadow-[#FF2D95]/30 border border-white/30'
                        : 'text-white bg-black/40 hover:bg-black/60 border border-[#FF2D95]/30 hover:border-[#FF2D95]/50'
                    }`}
                  >
                    This Year
                  </Button>
                  <Button
                    onClick={() => setAnalyticsPeriod('month')}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      analyticsPeriod === 'month'
                        ? 'bg-gradient-to-r from-[#FF2D95] to-[#B967FF] text-white shadow-2xl shadow-[#FF2D95]/30 border border-white/30'
                        : 'text-white bg-black/40 hover:bg-black/60 border border-[#FF2D95]/30 hover:border-[#FF2D95]/50'
                    }`}
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    onClick={() => setAnalyticsPeriod('week')}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      analyticsPeriod === 'week'
                        ? 'bg-gradient-to-r from-[#FF2D95] to-[#B967FF] text-white shadow-2xl shadow-[#FF2D95]/30 border border-white/30'
                        : 'text-white bg-black/40 hover:bg-black/60 border border-[#FF2D95]/30 hover:border-[#FF2D95]/50'
                    }`}
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    onClick={() => setAnalyticsPeriod('today')}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      analyticsPeriod === 'today'
                        ? 'bg-gradient-to-r from-[#FF2D95] to-[#B967FF] text-white shadow-2xl shadow-[#FF2D95]/30 border border-white/30'
                        : 'text-white bg-black/40 hover:bg-black/60 border border-[#FF2D95]/30 hover:border-[#FF2D95]/50'
                    }`}
                  >
                    Today
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
                  {[
                    { label: "Total XP",
                      value: userData.xp, 
                      color: "from-[#FF2D95] to-[#B967FF]",
                      icon: "⭐" },
                    
                    {
                      label: "Tasks Completed",
                      value: userData.completedTasks,
                      color: "from-[#B967FF] to-[#FF2D95]",
                      icon: "✅",
                    },
                    {
                      label: "Focus Time (min)",
                      value: userData.totalFocusTime,
                      color: "from-[#00E0FF] to-[#FF2D95]",
                      icon: "⏰",
                    },
                    {
                      label: "Epic Streak",
                      value: `${userData.streak} days`,
                      color: "from-[#B967FF] to-[#00E0FF]",
                      icon: "🔥",
                    },
                  ].map((stat, index) => (
                    <Card
                      key={index}
                      className="group bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-500 hover:scale-105"
                    >
                      <CardContent className="p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                        <div className="relative z-10">
                          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                            {stat.icon}
                          </div>
                          <div
                            className={`text-5xl font-black mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                          >
                            {stat.value}
                          </div>
                          <div className="text-white font-bold tracking-wide mb-2 text-lg">{stat.label}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}