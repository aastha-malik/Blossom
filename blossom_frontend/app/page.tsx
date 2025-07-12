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
  const [currentPage, setCurrentPage] = useState("dashboard")
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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setTimerRunning(false)
      gainXP(50)
      setTimerSeconds(1500)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerSeconds])

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
    { id: "dashboard", label: "Dashboard", color: "from-[#FF2D95] to-[#B967FF]", icon: "🏠" },
    { id: "tasks", label: "Tasks", color: "from-[#00E0FF] to-[#B967FF]", icon: "✅" },
    { id: "timer", label: "Focus Timer", color: "from-[#B967FF] to-[#FF2D95]", icon: "⏰" },
    { id: "pets", label: "My Pets", color: "from-[#FF2D95] to-[#00E0FF]", icon: "🐾" },
    { id: "analytics", label: "Analytics", color: "from-[#00E0FF] to-[#FF2D95]", icon: "📊" },
  ]

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
              <div className="relative">
                {/* --- BLOSSOM FOCUS HEADING --- */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black bg-gradient-to-r from-[#FF2D95] via-[#00E0FF] to-[#B967FF] bg-clip-text text-transparent drop-shadow-2xl animate-gradient-move">BLOSSOM FOCUS</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-[#FF2D95]/20 to-[#00E0FF]/20 blur-2xl rounded-lg -z-10"></div>
              </div>

              <div className="flex items-center gap-6">
                {userData.isLoggedIn && (
                  <div className="text-center">
                    <div className="text-sm font-bold text-[#00E0FF]">👋 {userData.username}</div>
                    <div className="text-xs text-white/60">{userData.email}</div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-2xl font-black text-transparent bg-gradient-to-r from-[#00E0FF] to-[#B967FF] bg-clip-text">
                    LEVEL {userData.level}
                  </div>
                  <div className="text-sm text-white font-bold">
                    {userData.xp} / {userData.xpToNext} XP
                  </div>
                </div>

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
                              return (
                      <>
                        <h2 className="text-4xl font-bold text-center mb-2">{pet.name}</h2>
                        <div className="mb-4 text-center text-lg">Age: {pet.ageInYears.toFixed(1)} years</div>
                        <div className="mb-4 text-center">{getPetStageInfo(pet.ageInYears).description}</div>
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
                                return (
                                  <>
                        <h2 className="text-4xl font-bold text-center mb-2">{pet.name}</h2>
                        <div className="mb-4 text-center text-lg">Age: {pet.ageInYears.toFixed(1)} years</div>
                        <div className="mb-4 text-center">{getPetStageInfo(pet.ageInYears).description}</div>
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
          {currentPage === "dashboard" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] bg-clip-text text-white drop-shadow-2xl animate-gradient-move">
                  ✨ DASHBOARD
                </h2>
                <p className="text-white text-xl font-bold">
                  {userData.isLoggedIn
                    ? `Welcome back, ${userData.username}! Your productivity command center awaits.`
                    : "Your productivity command center (Sign in to sync progress!)"}
                </p>
              </div>

              {!userData.isLoggedIn && (
                <Card className="bg-black/60 border-2 border-[#00E0FF]/30 backdrop-blur-xl mb-8">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🌟</div>
                    <h3 className="text-2xl font-bold text-[#00E0FF] mb-2">You're in Guest Mode!</h3>
                    <p className="text-white/80 mb-4">
                      Your progress is saved locally. Sign up to sync across devices and unlock exclusive features!
                    </p>
                    <Button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-[#00E0FF] to-[#FF2D95] hover:shadow-lg hover:shadow-[#00E0FF]/30 transition-all duration-300 transform hover:scale-105 px-8 py-3 font-bold rounded-xl text-white animate-gradient-move"
                    >
                      🚀 Create Free Account
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    label: "Tasks Completed",
                    value: userData.completedTasks,
                    color: "from-[#00E0FF] to-[#B967FF]",
                    icon: "🎯",
                    rank: "MASTER",
                  },
                  {
                    label: "Focus Sessions",
                    value: userData.focusSessions,
                    color: "from-[#B967FF] to-[#FF2D95]",
                    icon: "⚡",
                    rank: "EXPERT",
                  },
                  {
                    label: "Active Pets",
                    value: userData.pets.filter((p) => p.isAlive).length,
                    color: "from-[#FF2D95] to-[#00E0FF]",
                    icon: "🐾",
                    rank: "CARETAKER",
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    className="group bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-500 hover:scale-105"
                  >
                    <CardContent className="p-8 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10 rounded-lg"></div>
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
                        <Badge className={`bg-gradient-to-r ${stat.color} text-white border-0 font-bold`}>
                          {stat.rank}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mb-12">
                <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] bg-clip-text text-transparent animate-gradient-move">
                  ⚡ POWER ACTIONS
                </h3>
                <div className="flex flex-wrap gap-6">
                  {[
                    {
                      text: "🎯 START FOCUS MISSION 🎯",
                      page: "timer",
                      gradient: "from-[#FF2D95] via-[#B967FF] to-[#00E0FF]",
                      reward: "+50 XP",
                    },
                    {
                      text: "➕ CREATE TASK ➕",
                      page: "tasks",
                      gradient: "from-[#00E0FF] via-[#B967FF] to-[#FF2D95]",
                      reward: "+10-25 XP",
                    },
                    {
                      text: "🐾 VISIT PETS 🐾",
                      page: "pets",
                      gradient: "from-[#B967FF] via-[#FF2D95] to-[#00E0FF]",
                      reward: "Care & Feed",
                    },
                  ].map((action, index) => (
                    <div key={index} className="relative group">
                      <Button
                        onClick={() => setCurrentPage(action.page)}
                        className={`bg-gradient-to-r ${action.gradient} hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-110 px-10 py-6 text-xl font-black border-0 rounded-2xl text-white`}
                      >
                        {action.text}
                      </Button>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-[#00E0FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {action.reward}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] bg-clip-text text-transparent animate-gradient-move">
                  🎮 ACTIVE TASKS
                </h3>
                <div className="space-y-4">
                  {userData.tasks.slice(0, 3).map((task, index) => (
                    <Card
                      key={task.id}
                      className="group bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl hover:shadow-xl hover:shadow-[#FF2D95]/20 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-white font-bold text-lg">{task.title}</span>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge
                                variant="outline"
                                className={`${
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentPage === "tasks" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-[#00E0FF] via-[#B967FF] to-[#FF2D95] bg-clip-text text-white drop-shadow-2xl animate-gradient-move">
                  ✅ TASK MANAGER ✅
                </h2>
                <p className="text-white text-xl font-bold">Complete tasks to earn XP and level up!</p>
              </div>

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
                        {(["low", "medium", "high"] as const).map((priority) => (
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

              <div className="space-y-6">
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
                    <Card
                      key={task.id}
                      className="group bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl hover:shadow-xl hover:shadow-[#FF2D95]/20 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <span className="text-white font-bold text-xl">{task.title}</span>
                              <div className="text-[#00E0FF] font-bold text-lg mt-1">
                                🌟 REWARD: +{task.xpReward} XP
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                onClick={() => completeTask(task.id)}
                                className="bg-gradient-to-r from-[#00E0FF] to-[#B967FF] hover:shadow-lg hover:shadow-[#00E0FF]/30 transition-all duration-300 transform hover:scale-110 w-12 h-12 rounded-full text-xl text-white animate-gradient-move"
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                                className="bg-gradient-to-r from-[#FF2D95] to-[#B967FF] hover:shadow-lg hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-110 w-12 h-12 rounded-full text-xl text-white animate-gradient-move"
                              >
                                ✗
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <Badge
                              variant="outline"
                              className={`${
                                task.priority === "high"
                                  ? "border-[#FF2D95] text-[#FF2D95] bg-[#FF2D95]/10"
                                  : task.priority === "medium"
                                    ? "border-[#B967FF] text-[#B967FF] bg-[#B967FF]/10"
                                    : "border-[#00E0FF] text-[#00E0FF] bg-[#00E0FF]/10"
                              } font-bold px-4 py-2 border-2`}
                            >
                              {task.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <span className="text-white font-bold">Task Created: {task.created}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {currentPage === "timer" && (
            <div className="space-y-8">
              {!isFullscreen ? (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-[#B967FF] via-[#FF2D95] to-[#00E0FF] bg-clip-text text-white drop-shadow-2xl animate-gradient-move">
                      ⏰ FOCUS ARENA
                    </h2>
                    <p className="text-white text-xl font-bold">Enter the zone and earn massive XP rewards!</p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-8">
                    <Card className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
                      <CardContent className="p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                        <div className="relative z-10">
                          <div className="text-9xl font-black text-transparent bg-gradient-to-r from-[#00E0FF] via-[#B967FF] to-[#FF2D95] bg-clip-text mb-8 font-mono tracking-wider drop-shadow-2xl">
                            {formatTime(timerSeconds)}
                          </div>
                          <div className="w-40 h-2 bg-gradient-to-r from-[#00E0FF] to-[#FF2D95] rounded-full mx-auto mb-4"></div>
                          <div className="text-2xl font-bold text-[#00E0FF]">🌟 +50 XP ON COMPLETION</div>
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#00E0FF]/30 to-[#FF2D95]/30 blur-2xl rounded-3xl -z-10"></div>
                      </CardContent>
                    </Card>

                    {showNoteInput && (
                      <Card className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
                        <CardContent className="p-6 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                          <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4 text-transparent bg-gradient-to-r from-[#FF2D95] to-[#00E0FF] bg-clip-text">
                              📝 Focus Notes
                            </h3>
                            <textarea
                              value={focusNote}
                              onChange={(e) => setFocusNote(e.target.value)}
                              placeholder="Jot down thoughts, ideas, or reminders during your focus session..."
                              className="w-full h-32 bg-black/70 border-2 border-[#FF2D95]/50 text-white text-sm p-4 rounded-xl backdrop-blur-sm focus:border-[#00E0FF] focus:ring-[#00E0FF]/20 transition-all duration-300 placeholder:text-white/50 resize-none"
                            />
                            <div className="text-xs text-white/60 mt-2">
                              💡 Quick notes to capture ideas without breaking focus
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex justify-center gap-8">
                      <Button
                        onClick={() => setTimerRunning(!timerRunning)}
                        className="bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-110 px-16 py-8 text-2xl font-black rounded-2xl text-white animate-gradient-move"
                      >
                        {timerRunning ? "⏸️ PAUSE MISSION" : "🎯 START MISSION"}
                      </Button>
                      <Button
                        onClick={resetTimer}
                        className="bg-gradient-to-r from-[#00E0FF] via-[#B967FF] to-[#FF2D95] hover:shadow-2xl hover:shadow-[#00E0FF]/30 transition-all duration-300 transform hover:scale-110 px-16 py-8 text-2xl font-black rounded-2xl text-white animate-gradient-move"
                      >
                        🔄 RESET MISSION
                      </Button>
                    </div>

                    <Card className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl">
                      <CardContent className="p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                        <div className="relative z-10">
                          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] bg-clip-text text-transparent animate-gradient-move">
                            ⚡ MISSION DURATION
                          </h3>
                          <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {[
                              { label: "QUICK BURST", time: "25 min", seconds: 1500, emoji: "🚀", xp: "+50 XP" },
                              { label: "POWER SESSION", time: "45 min", seconds: 2700, emoji: "💪", xp: "+75 XP" },
                              { label: "ULTRA FOCUS", time: "60 min", seconds: 3600, emoji: "🔥", xp: "+100 XP" },
                            ].map(({ label, time, seconds, emoji, xp }) => (
                              <div key={label} className="flex-1 max-w-xs">
                                <Button
                                  onClick={() => !timerRunning && setTimerSeconds(seconds)}
                                  variant="outline"
                                  className={`w-full h-auto ${
                                    timerSeconds === seconds && !timerRunning
                                      ? "bg-gradient-to-r from-[#B967FF] to-[#FF2D95] text-white border-0 shadow-lg shadow-[#B967FF]/30"
                                      : "border-2 border-[#FF2D95]/50 text-white bg-black/50 hover:bg-black/70 hover:border-[#FF2D95]"
                                  } px-4 py-6 text-sm font-black rounded-xl transition-all duration-300 transform hover:scale-105`}
                                  disabled={timerRunning}
                                >
                                  <div className="text-center">
                                    <div className="text-2xl mb-2">{emoji}</div>
                                    <div className="font-black text-white text-xs">{label}</div>
                                    <div className="text-xs text-white/80">{time}</div>
                                  </div>
                                </Button>
                                <div className="text-[#00E0FF] font-bold text-xs mt-2 text-center">{xp}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                /* Fullscreen Mode */
                <div className="fixed inset-0 bg-[#18181A] z-50 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FF2D95]/10 to-[#B967FF]/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-[#00E0FF]/10 to-[#B967FF]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  </div>

                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="absolute top-8 right-8 bg-black/60 hover:bg-black/80 border border-[#FF2D95]/30 hover:border-[#FF2D95]/50 rounded-lg p-3 text-white transition-all duration-300 transform hover:scale-110 z-10"
                    title="Exit Fullscreen"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className={`absolute top-8 right-24 border rounded-lg p-3 text-white transition-all duration-300 transform hover:scale-110 z-10 ${
                      showNoteInput
                        ? "bg-gradient-to-r from-[#FF2D95] to-[#00E0FF] border-[#FF2D95]"
                        : "bg-black/60 hover:bg-black/80 border-[#FF2D95]/30 hover:border-[#FF2D95]/50"
                    }`}
                    title="Toggle Notes"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <div className="text-center relative z-10">
                    <div className="text-[12rem] md:text-[16rem] font-black text-transparent bg-gradient-to-r from-[#00E0FF] via-[#B967FF] to-[#FF2D95] bg-clip-text mb-8 font-mono tracking-wider drop-shadow-2xl">
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="w-80 h-3 bg-gradient-to-r from-[#00E0FF] to-[#FF2D95] rounded-full mx-auto mb-8"></div>
                    <div className="text-4xl font-bold text-[#00E0FF] mb-12">🌟 FOCUS MODE ACTIVE</div>
                  </div>

                  <div className="flex gap-8 relative z-10">
                    <Button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="bg-gradient-to-r from-[#FF2D95] via-[#B967FF] to-[#00E0FF] hover:shadow-2xl hover:shadow-[#FF2D95]/30 transition-all duration-300 transform hover:scale-110 px-12 py-6 text-xl font-black rounded-2xl text-white animate-gradient-move"
                    >
                      {timerRunning ? "⏸️ PAUSE" : "🎯 START"}
                    </Button>
                    <Button
                      onClick={resetTimer}
                      className="bg-gradient-to-r from-[#00E0FF] via-[#B967FF] to-[#FF2D95] hover:shadow-2xl hover:shadow-[#00E0FF]/30 transition-all duration-300 transform hover:scale-110 px-12 py-6 text-xl font-black rounded-2xl text-white animate-gradient-move"
                    >
                      🔄 RESET
                    </Button>
                  </div>

                  {showNoteInput && (
                    <div className="absolute bottom-8 left-8 right-8 max-w-2xl mx-auto">
                      <div className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">📝</span>
                          <h3 className="text-lg font-bold text-transparent bg-gradient-to-r from-[#FF2D95] to-[#00E0FF] bg-clip-text">
                            Quick Notes
                          </h3>
                        </div>
                        <textarea
                          value={focusNote}
                          onChange={(e) => setFocusNote(e.target.value)}
                          placeholder="Capture thoughts without breaking focus..."
                          className="w-full h-24 bg-black/70 border-2 border-[#FF2D95]/50 text-white text-sm p-4 rounded-xl backdrop-blur-sm focus:border-[#00E0FF] focus:ring-[#00E0FF]/20 transition-all duration-300 placeholder:text-white/50 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentPage === "analytics" && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-[#00E0FF] via-[#FF2D95] to-[#B967FF] bg-clip-text text-white drop-shadow-2xl animate-gradient-move">
                  📊 PLAYER STATS
                </h2>
                <p className="text-white text-xl font-bold">Track your journey to productivity mastery!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {[
                  { label: "Total XP", value: userData.xp, color: "from-[#FF2D95] to-[#B967FF]", icon: "⭐" },
                  { label: "Current Level", value: userData.level, color: "from-[#00E0FF] to-[#B967FF]", icon: "🏆" },
                  {
                    label: "Tasks Completed",
                    value: userData.completedTasks,
                    color: "from-[#B967FF] to-[#FF2D95]",
                    icon: "✅",
                  },
                  {
                    label: "Focus Missions",
                    value: userData.focusSessions,
                    color: "from-[#FF2D95] to-[#00E0FF]",
                    icon: "⚡",
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
                        <div className="text-white font-bold tracking-wide text-lg">{stat.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-black/80 border-2 border-[#FF2D95]/30 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D95]/10 to-[#00E0FF]/10"></div>
                  <div className="relative z-10">
                    <h3 className="text-4xl font-black mb-8 text-center text-transparent bg-gradient-to-r from-[#00E0FF] to-[#FF2D95] bg-clip-text animate-gradient-move">
                      🏆 ACHIEVEMENT VAULT
                    </h3>
                    <div className="space-y-6">
                      {[
                        {
                          icon: "🎯",
                          name: "FIRST TASK",
                          desc: "Complete your first task",
                          unlocked: userData.completedTasks > 0,
                          gradient: "from-[#00E0FF] to-[#B967FF]",
                          reward: "+10 XP",
                        },
                        {
                          icon: "⏰",
                          name: "FOCUS MASTER",
                          desc: "Complete 10 focus missions",
                          unlocked: userData.focusSessions >= 10,
                          gradient: "from-[#B967FF] to-[#FF2D95]",
                          reward: "+50 XP",
                        },
                        {
                          icon: "🐾",
                          name: "PET PARENT",
                          desc: "Adopt your first pet",
                          unlocked: userData.pets.length > 0,
                          gradient: "from-[#FF2D95] to-[#00E0FF]",
                          reward: "+25 XP",
                        },
                        {
                          icon: "🔥",
                          name: "STREAK LEGEND",
                          desc: "Maintain a 7-day streak",
                          unlocked: userData.streak >= 7,
                          gradient: "from-[#00E0FF] to-[#FF2D95]",
                          reward: "+75 XP",
                        },
                        {
                          icon: "⭐",
                          name: "LEVEL CHAMPION",
                          desc: "Reach Level 5",
                          unlocked: userData.level >= 5,
                          gradient: "from-[#B967FF] to-[#00E0FF]",
                          reward: "+100 XP",
                        },
                      ].map((achievement, index) => (
                        <div
                          key={index}
                          className={`group flex items-center p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] border-2 ${
                            achievement.unlocked
                              ? `bg-black/60 shadow-lg border-[#FF2D95]/50`
                              : "bg-black/30 border-white/20"
                          }`}
                        >
                          <div className="text-5xl mr-6 group-hover:scale-110 transition-transform duration-300">
                            {achievement.unlocked ? achievement.icon : "🔒"}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`text-2xl font-black mb-1 ${
                                achievement.unlocked
                                  ? `text-transparent bg-gradient-to-r ${achievement.gradient} bg-clip-text`
                                  : "text-white/40"
                              }`}
                            >
                              {achievement.name}
                            </div>
                            <div className={`text-sm ${achievement.unlocked ? "text-white" : "text-white/40"}`}>
                              {achievement.desc}
                            </div>
                            {achievement.unlocked && (
                              <div className="text-[#00E0FF] font-bold text-sm mt-1">{achievement.reward}</div>
                            )}
                          </div>
                          <div
                            className={`text-lg font-black px-6 py-3 rounded-full border-2 ${
                              achievement.unlocked
                                ? `text-white bg-gradient-to-r ${achievement.gradient} border-white/30`
                                : "text-white/40 border-white/20 bg-black/30"
                            }`}
                          >
                            {achievement.unlocked ? "✓ UNLOCKED" : "LOCKED"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
