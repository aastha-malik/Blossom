"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Pet {
  id: string
  name: string
  type: "dog" | "cat"
  ageInYears: number
  stage: "baby" | "young" | "adult" | "elder"
  hunger: number // 0-100, 0 = starving, 100 = full
  happiness: number // 0-100
  health: number // 0-100
  lastFed: string // ISO date string
  daysSinceLastFed: number
  isAlive: boolean
  birthDate: string
  totalFoodEaten: number
  level: number // Pet's own level based on care
}

interface UserData {
  level: number
  xp: number
  xpToNext: number
  streak: number
  tasks: Task[]
  completedTasks: number
  focusSessions: number
  totalFocusTime: number
  coins: number
  powerUps: string[]
  isLoggedIn: boolean
  username?: string
  email?: string
  pets: Pet[]
  activePetId?: string
}

interface Task {
  id: string
  title: string
  priority: "low" | "medium" | "high"
  created: string
  xpReward: number
}

export default function BlossomFocusPreview() {
  const [currentPage, setCurrentPage] = useState("focus")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

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
  })

  const [newTask, setNewTask] = useState("")
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const [timerSeconds, setTimerSeconds] = useState(1500)
  const [timerRunning, setTimerRunning] = useState(false)
  const [showXpGain, setShowXpGain] = useState(false)
  const [xpGainAmount, setXpGainAmount] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [focusNote, setFocusNote] = useState("")
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [showPetCreator, setShowPetCreator] = useState(false)
  const [newPetName, setNewPetName] = useState("")
  const [newPetType, setNewPetType] = useState<"dog" | "cat">("dog")
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)
  // Add state for custom focus minutes
  // Add state for recent custom times
  // Remove the purple recent times box and add quick-pick/recent time pills below the timer
  // const [showCustomInput, setShowCustomInput] = useState(false);
  // const [customInputValue, setCustomInputValue] = useState(30);
  // const quickPickTimes = [15, 25, 45];

  const [analyticsPeriod, setAnalyticsPeriod] = useState<'all'|'year'|'month'|'week'|'today'>('all');

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    }))
    setParticles(newParticles)
  }, [])

  // Update pet status every hour
  useEffect(() => {
    const updatePetStatus = () => {
      setUserData((prev) => ({
        ...prev,
        pets: prev.pets.map((pet) => {
          if (!pet.isAlive) return pet

          const now = new Date()
          const lastFed = new Date(pet.lastFed)
          const daysSinceLastFed = Math.floor((now.getTime() - lastFed.getTime()) / (1000 * 60 * 60 * 24))

          const newHunger = Math.max(0, pet.hunger - daysSinceLastFed * 15)
          let newHealth = pet.health
          let newHappiness = pet.happiness
          let isAlive = pet.isAlive

          if (newHunger < 30) {
            newHealth = Math.max(0, newHealth - daysSinceLastFed * 10)
            newHappiness = Math.max(0, newHappiness - daysSinceLastFed * 20)
          }

          if (daysSinceLastFed >= 7) {
            isAlive = false
            newHealth = 0
            newHappiness = 0
          }

          return {
            ...pet,
            daysSinceLastFed,
            hunger: newHunger,
            health: newHealth,
            happiness: newHappiness,
            isAlive,
          }
        }),
      }))
    }

    updatePetStatus()
    const interval = setInterval(updatePetStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  // Update timerSeconds when focusMinutes changes and timer is not running
  // useEffect(() => {
  //   if (!timerRunning) setTimerSeconds(focusMinutes * 60);
  // }, [focusMinutes]);

  // Calculate XP dynamically
  // const sessionXP = focusMinutes * 2;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setTimerRunning(false)
      if (focusedTaskId) {
        completeTask(focusedTaskId)
        setFocusedTaskId(null)
      }
      setTimerSeconds(1500)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerSeconds]) // Removed focusMinutes from dependency array

  // On timer completion, add to recent times
  useEffect(() => {
    if (timerSeconds === 0 && !timerRunning) {
      // setRecentFocusTimes(prev => [focusMinutes, ...prev.slice(0, 4)]); // This line is removed
    }
  }, [timerSeconds, timerRunning]);

  const gainXP = (amount: number) => {
    setXpGainAmount(amount)
    setShowXpGain(true)
    setUserData((prev) => ({
      ...prev,
      xp: prev.xp + amount,
      coins: prev.coins + Math.floor(amount / 5),
    }))
    setTimeout(() => setShowXpGain(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setTimerSeconds(1500)
  }

  const getActivePet = (): Pet | undefined => {
    return userData.pets.find((pet) => pet.id === userData.activePetId)
  }

  const getPetStageInfo = (ageInYears: number) => {
    if (ageInYears < 1) {
      return { stage: "baby", foodCost: 50, size: "text-8xl", description: "Tiny & Adorable" }
    } else if (ageInYears < 5) {
      return { stage: "young", foodCost: 100, size: "text-9xl", description: "Growing & Playful" }
    } else if (ageInYears < 10) {
      return { stage: "adult", foodCost: 150, size: "text-[10rem]", description: "Strong & Mature" }
    } else {
      return { stage: "elder", foodCost: 200, size: "text-[12rem]", description: "Wise & Majestic" }
    }
  }

  const getPetEmoji = (pet: Pet) => {
    if (!pet.isAlive) return pet.type === "dog" ? "💀🐕" : "💀🐱"

    const stageInfo = getPetStageInfo(pet.ageInYears)

    if (pet.type === "dog") {
      switch (stageInfo.stage) {
        case "baby":
          return "🐶"
        case "young":
          return "🐕"
        case "adult":
          return "🐕‍🦺"
        case "elder":
          return "🦮"
        default:
          return "🐕"
      }
    } else {
      switch (stageInfo.stage) {
        case "baby":
          return "🐱"
        case "young":
          return "🐈"
        case "adult":
          return "🐈‍⬛"
        case "elder":
          return "🦁"
        default:
          return "🐱"
      }
    }
  }

  const feedPet = (petId: string, useStreak = false) => {
    const pet = userData.pets.find((p) => p.id === petId)
    if (!pet) return

    const stageInfo = getPetStageInfo(pet.ageInYears)
    const foodCost = stageInfo.foodCost
    const streakCost = 1

    if (useStreak && userData.streak < streakCost) {
      alert("Not enough streak days! You need at least 1 streak day.")
      return
    }

    if (!useStreak && userData.xp < foodCost) {
      alert(`Not enough XP! You need ${foodCost} XP to feed a ${stageInfo.stage} pet.`)
      return
    }

    setUserData((prev) => ({
      ...prev,
      xp: useStreak ? prev.xp : prev.xp - foodCost,
      streak: useStreak ? prev.streak - streakCost : prev.streak,
      pets: prev.pets.map((p) => {
        if (p.id === petId) {
          const newHunger = Math.min(100, p.hunger + 40)
          const newHappiness = Math.min(100, p.happiness + 20)
          const newHealth = Math.min(100, p.health + 10)
          const newLevel = Math.floor(p.totalFoodEaten / 10) + 1
          const newAge = Math.min(15, p.ageInYears + 0.1) // Slight age increase with feeding

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
          }
        }
        return p
      }),
    }))

    gainXP(useStreak ? 0 : 10)
    alert(`🍖 Fed ${pet.name}! They're much happier now! ${useStreak ? "(Used 1 streak day)" : `(-${foodCost} XP)`}`)
  }

  const createPet = () => {
    if (!newPetName.trim()) {
      alert("Please enter a name for your pet!")
      return
    }

    const newPet: Pet = {
      id: Date.now().toString(),
      name: newPetName.trim(),
      type: newPetType,
      ageInYears: 0.1, // Start as baby
      stage: "baby",
      hunger: 100,
      happiness: 100,
      health: 100,
      lastFed: new Date().toISOString(),
      daysSinceLastFed: 0,
      isAlive: true,
      birthDate: new Date().toISOString(),
      totalFoodEaten: 0,
      level: 1,
    }

    setUserData((prev) => ({
      ...prev,
      pets: [...prev.pets, newPet],
      activePetId: newPet.id,
    }))

    setNewPetName("")
    setShowPetCreator(false)
    alert(`🎉 Welcome ${newPet.name}! Your new ${newPet.type} is ready to grow with you!`)
  }

  const revivePet = (petId: string) => {
    const reviveCost = 200

    if (userData.xp < reviveCost) {
      alert("Not enough XP! You need 200 XP to revive your pet.")
      return
    }

    setUserData((prev) => ({
      ...prev,
      xp: prev.xp - reviveCost,
      pets: prev.pets.map((pet) => {
        if (pet.id === petId) {
          return {
            ...pet,
            isAlive: true,
            hunger: 50,
            happiness: 50,
            health: 50,
            lastFed: new Date().toISOString(),
            daysSinceLastFed: 0,
          }
        }
        return pet
      }),
    }))

    alert(`💖 ${getActivePet()?.name} has been revived! Take better care of them this time!`)
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()

    if (authMode === "signup") {
      if (authForm.password !== authForm.confirmPassword) {
        alert("Passwords don't match!")
        return
      }
      if (!authForm.username || !authForm.email || !authForm.password) {
        alert("Please fill in all fields!")
        return
      }
    } else {
      if (!authForm.username && !authForm.email) {
        alert("Please enter username or email!")
        return
      }
      if (!authForm.password) {
        alert("Please enter password!")
        return
      }
    }

    setUserData((prev) => ({
      ...prev,
      isLoggedIn: true,
      username: authForm.username || "TechGirl",
      email: authForm.email || "techgirl@example.com",
    }))

    setShowAuthModal(false)
    setAuthForm({ username: "", email: "", password: "", confirmPassword: "" })

    gainXP(authMode === "signup" ? 50 : 25)
    setTimeout(() => {
      alert(authMode === "signup" ? "🎉 Welcome to Blossom Focus! +50 XP Bonus!" : "✨ Welcome back! +25 XP Bonus!")
    }, 500)
  }

  const handleLogout = () => {
    setUserData((prev) => ({
      ...prev,
      isLoggedIn: false,
      username: undefined,
      email: undefined,
    }))
  }

  const addTask = () => {
    if (!newTask.trim()) return

    const xpReward = taskPriority === "high" ? 25 : taskPriority === "medium" ? 15 : 10

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      priority: taskPriority,
      created: new Date().toISOString().split("T")[0],
      xpReward,
    }

    setUserData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }))
    setNewTask("")
  }

  const completeTask = (taskId: string) => {
    const task = userData.tasks.find((t) => t.id === taskId)
    if (!task) return

    gainXP(task.xpReward)
    setUserData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      completedTasks: prev.completedTasks + 1,
    }))
  }

  const deleteTask = (taskId: string) => {
    setUserData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }))
  }

  const navItems = [
    { id: "focus", label: "Task & Focus", color: "from-[#B967FF] to-[#FF2D95]", icon: "⏰" },
    { id: "pets", label: "My Pets", color: "from-[#FF2D95] to-[#00E0FF]", icon: "🐾" },
    { id: "analytics", label: "Analytics", color: "from-[#00E0FF] to-[#FF2D95]", icon: "📊" },
  ]

  // const handlePickTime = (min: number) => {
  //   setFocusMinutes(min);
  //   setShowCustomInput(false);
  // };

  // const handleCustomInput = () => {
  //   if (customInputValue >= 1 && customInputValue <= 180) {
  //     setFocusMinutes(customInputValue);
  //     setRecentFocusTimes(prev => [customInputValue, ...prev.filter(t => t !== customInputValue).slice(0, 4)]);
  //     setShowCustomInput(false);
  //   }
  // };

  return (
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
          <Card className="w-full max-w-md bg-black/90 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
              <div className="relative z-10">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-0 right-0 text-white hover:text-[#FF2D95] text-2xl font-bold transition-colors duration-300"
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
                      setAuthMode(authMode === "login" ? "signup" : "login")
                      setAuthForm({ username: "", email: "", password: "", confirmPassword: "" })
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
          <Card className="w-full max-w-md bg-black/90 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
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
                  <button
                    onClick={handleLogout}
                    className="bg-black/40 border border-[#FF2D95]/30 rounded-lg px-4 py-2 text-sm font-bold text-white hover:bg-black/60 hover:border-[#FF2D95]/50 transition-all duration-300"
                  >
                    🚪 Logout
                  </button>
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
                          {/* Quick-pick and recent time pills */}
                          {/* Removed quick-pick and recent time pills */}
                          {/* Custom input pill */}
                          {/* Removed custom input pill */}
                          {/* Removed custom input UI */}
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
                      ) :
                  userData.tasks.map((task, index) => (
                    <Card
                      key={task.id}
                            className={`group bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl hover:shadow-xl hover:shadow-[#FF2D95]/20 transition-all duration-300 hover:scale-[1.02] ${focusedTaskId === task.id ? 'ring-4 ring-[#00E0FF]/60' : ''}`}
                            onClick={() => {
                              setFocusedTaskId(task.id);
                              setTimerSeconds(25 * 60); // Default to 25 minutes for new task
                            }}
                          >
                            <CardContent className="p-6 relative overflow-hidden cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                              <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1">
                                  <span className="text-white font-bold text-lg">{task.title}</span>
                                  <div className="flex items-center gap-4 mt-2">
                                    <Badge
                                      variant="outline"
                                      className={`$ {
                                        task.priority === "high"
                                          ? "border-[#FF2D95] text-[#FF2D95] bg-[#FF2D95]/10"
                                          : task.priority === "medium"
                                            ? "border-[#B967FF] text-[#B967FF] bg-[#B967FF]/10"
                                            : "border-[#00E0FF] text-[#00E0FF] bg-[#00E0FF]/10"
                                      } font-bold px-4 py-1 border-2`}
                                    >
                                      {task.priority.toUpperCase()}
                                    </Badge>
                                    <div className="text-[#00E0FF] font-bold text-sm">🌟 +{task.xpReward} XP REWARD</div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                    onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
                                className="bg-gradient-to-r from-[#00E0FF] to-[#B967FF] hover:shadow-lg hover:shadow-[#00E0FF]/30 transition-all duration-300 transform hover:scale-110 w-12 h-12 rounded-full text-xl text-white animate-gradient-move"
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                className="bg-gradient-to-r from-[#FF2D95] to-[#B967FF] hover:shadow-lg hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-110 w-12 h-12 rounded-full text-xl text-white animate-gradient-move"
                              >
                                ✗
                              </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                        ))}
              </div>
            </div>
                </div>
              </div>
              {/* Removed recent focus times section */}
            </>
          )}

          {currentPage === "pets" && (
            <div className="space-y-8">
              {/* --- MY PETS PAGE HEADER --- */}
              <div className="text-center mb-8 flex justify-center gap-2">
                <h2 className="text-7xl font-black mb-2 bg-gradient-to-r from-orange-400 via-pink-500 to-teal-400 bg-clip-text text-white drop-shadow-2xl">
                  🐾 MY PETS 🐾
                    </h2>
                  </div>

              {/* --- PET MANAGEMENT CARD --- */}
              <div className="flex justify-center mb-8">
                <div className="rounded-2xl border-2 border-[#7F5FFF] bg-black/80 px-8 py-6 flex items-center gap-8 w-full max-w-3xl shadow-lg">
                  <div>
                    <h3 className="text-xl font-bold text-[#7F5FFF] flex items-center gap-2 mb-2"><span className="text-lg">🐾</span> Pet Management</h3>
                    <div className="text-white/80 text-base">Number of Pets: <span className="text-[#00E0FF] font-bold">{userData.pets.length}</span></div>
                          </div>
                  <div className="flex-1"></div>
                      <Button
                      onClick={() => setShowPetCreator(true)}
                    className="bg-gradient-to-r from-orange-400 via-pink-500 to-teal-400 text-white font-bold rounded-full px-8 py-3 text-lg mx-auto block shadow-lg hover:from-pink-500 hover:to-orange-400 transition-colors"
                  >
                    Adopt pet
                      </Button>
                    </div>
                      </div>

              {/* --- MAIN PET SECTION --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* PET PICTURE CARD */}
                <div className="rounded-2xl bg-gradient-to-br from-white/10 via-pink-200/10 to-teal-200/10 backdrop-blur-md border border-white/20 shadow-xl p-8">
                  {getActivePet() ? (() => {
                    const pet = getActivePet();
                    if (!pet) return null;
                              return (
                      <>
                        <h2 className="text-4xl font-bold text-center mb-2">{pet.name}</h2>
                        <div className="mb-4 text-center text-lg">Age: {pet.ageInYears?.toFixed(1)}</div>
                        <div className="mb-4 text-center">{getPetStageInfo(pet.ageInYears)?.description}</div>
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-7xl drop-shadow-lg">{getPetEmoji(pet)}</span>
                  </div>
                </>
                    );
                  })() : (
                    <span className="text-2xl text-gray-900 font-bold">PET PICTURE</span>
                                    )}
                  </div>
                {/* PET STATS CARD */}
                <div className="rounded-2xl bg-gradient-to-br from-white/10 via-pink-200/10 to-teal-200/10 backdrop-blur-md border border-white/20 shadow-xl p-8">
                  {getActivePet() ? (() => {
                    const pet = getActivePet();
                    if (!pet) return null;
                                return (
                                  <>
                        <h2 className="text-4xl font-bold text-center mb-2">{pet.name}</h2>
                        <div className="mb-4 text-center text-lg">Age: {pet.ageInYears?.toFixed(1)}</div>
                        <div className="mb-4 text-center">{getPetStageInfo(pet.ageInYears)?.description}</div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-bold text-pink-600">Hunger:</span>
                          <span className="font-bold text-pink-600">{pet.hunger}%</span>
                    </div>
                        <Progress
                          value={pet.hunger}
                          className="h-3 bg-white rounded-full border border-white-200"
                        />
                    <Button
                                            onClick={() => feedPet(pet.id, false)}
                          className="mt-6 bg-gradient-to-r from-orange-400 via-pink-500 to-teal-400 text-white font-bold rounded-full px-8 py-3 text-lg mx-auto block shadow-lg hover:from-pink-500 hover:to-orange-400 transition-colors"
                    >
                          Feed {pet.name} 
                    </Button>
                      </>
                    );
                  })() : (
                    <span className="text-2xl text-gray-900 font-bold">PET STATS</span>
                  )}
                            </div>
                  </div>

              {/* --- MORE PETS SECTION (GALLERY) --- */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {userData.pets.map((pet) => (
                  <div key={pet.id} className="rounded-xl bg-black/60 border-2 border-[#7F5FFF]/40 p-4 flex flex-col items-center shadow-md cursor-pointer hover:border-[#B967FF] transition-all duration-200"
                    onClick={() => setUserData((prev) => ({ ...prev, activePetId: pet.id }))}
                  >
                    <div className="text-4xl mb-2">{getPetEmoji(pet)}</div>
                    <div className="font-bold text-white mb-1">{pet.name}</div>
                    <div className="text-xs text-[#7F5FFF]">{pet.type} • Lv{pet.level}</div>
                        </div>
                ))}
                      </div>
            </div>
          )}

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
  );
}