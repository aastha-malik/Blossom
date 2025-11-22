# 🌸 Blossom 🌸

A productivity app that combines task management, focus sessions, and gamification with a tech-girly aesthetic! 🌸✨

## Features

- **Task Management**: Add, organize, and prioritize daily tasks
- **Focus Sessions**: Pomodoro/deep work timers with progress tracking
- **Gamification**: Earn XP and maintain your streaks
- **Digital Pet**: Keep your cute, techy pet happy by staying productive (DOG / CAT)
- **Analytics**: Visualize Your productivity trends, streaks, time spent and task done per week, month, year, today, and of all time as well
- **Tech-Girly Aesthetic**: Neon colors, futuristic fonts, and holographic vibes

## Installation

1. Make sure you have Python 3.7+ installed
2. Clone or download this project
3. Run the frontend:
   \`\`\`bash
   cd fe
   python main.py
   \`\`\`

## Project Structure

\`\`\`
blossom-focus/
├── blossom_fe/           # Frontend (Python Web App)
│   ├── main.py           # Main application (Web App)
│   └── user_data.json    # User data storage
├── blossom_be/           # Backend (Your implementation)
│   ├── be/
|     ├──__init__.py
|     ├──main.py          # my main backend & all other files are connected here
│     └── api.py          # Sample API structure
|   ├──db/
|      ├──schema.sql
└── blossom_gui/           # Frontend (Python Gui)
    └── main.py            # Main Apllication (GUI app)
\`\`\`

## Usage

1. **Tasks & Focus Timer**: Add, manage, and complete tasks to earn XP and also have your focus timer of 25 min along side so no change in tabs again and again all needed stuff at one place
2. **Analytics**: Track your productivity trends and achievements
3. **Settings**: Customize your experience and manage data  # for Logged in Users only (not in web but present in GUI)

## Gamification System

- **XP System**: Earn 10 XP per completed task, 25 XP per focus session
- **Pet Hunger**: so yeah your pet need to be  feed to which you can buy your food using the XPs 


Happy focusing! 🎯✨
