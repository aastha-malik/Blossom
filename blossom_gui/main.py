import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from datetime import datetime, timedelta
import threading
import time

class BlossomFocusApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Blossom Focus: Tech-Girly Edition")
        self.root.geometry("1200x800")
        self.root.configure(bg='#18181A')
        
        # App state
        self.current_page = "focus" # Changed to "focus"
        self.user_data = self.load_user_data()
        self.timer_running = False
        self.timer_seconds = 0
        self.focus_session_length = 25 * 60  # 25 minutes default
        
        # Colors
        self.colors = {
            'hot_pink': '#FF2D95',
            'electric_blue': '#00E0FF',
            'neon_purple': '#B967FF',
            'black': '#18181A',
            'white': '#FFFFFF',
            'dark_gray': '#2A2A2A',
            'light_gray': '#404040'
        }
        
        self.setup_styles()
        self.create_main_interface()
        
    def setup_styles(self):
        """Configure custom styles for the app"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure custom styles
        style.configure('Neon.TButton', 
                       background=self.colors['hot_pink'],
                       foreground=self.colors['white'],
                       borderwidth=0,
                       focuscolor='none',
                       font=('Montserrat', 10, 'bold'))
        
        style.configure('Electric.TButton',
                       background=self.colors['electric_blue'],
                       foreground=self.colors['black'],
                       borderwidth=0,
                       focuscolor='none',
                       font=('Montserrat', 10, 'bold'))
        
        style.configure('Purple.TButton',
                       background=self.colors['neon_purple'],
                       foreground=self.colors['white'],
                       borderwidth=0,
                       focuscolor='none',
                       font=('Montserrat', 10, 'bold'))
    
    def load_user_data(self):
        """Load user data from JSON file"""
        try:
            if os.path.exists('fe/user_data.json'):
                with open('fe/user_data.json', 'r') as f:
                    return json.load(f)
        except:
            pass
        
        # Default user data
        default_pet = {
            'id': 0,
            'name': 'Blossom',
            'type': 'cat',
            'age': 0,
            'level': 1,
            'xp': 0,
            'happiness': 100,
            'hunger': 100,
            'last_fed': datetime.now().strftime('%Y-%m-%d'),
            'is_alive': True
        }
        return {
            'pets': [default_pet],
            'current_pet_id': 0,
            'level': 1,
            'xp': 0,
            'streak': 0,
            'tasks': [],
            'completed_tasks': 0,
            'focus_sessions': 0,
            'total_focus_time': 0,
            'achievements': [],
            'theme': 'neon_garden'
        }

    def get_current_pet(self):
        pets = self.user_data.get('pets', [])
        pet_id = self.user_data.get('current_pet_id', 0)
        for pet in pets:
            if pet['id'] == pet_id:
                return pet
        return pets[0] if pets else None

    def save_current_pet(self, pet):
        pets = self.user_data.get('pets', [])
        for i, p in enumerate(pets):
            if p['id'] == pet['id']:
                pets[i] = pet
                break
        self.user_data['pets'] = pets
        self.save_user_data()

    def update_pet_hunger(self, pet):
        from datetime import datetime
        last_fed = datetime.strptime(pet['last_fed'], '%Y-%m-%d')
        days_unfed = (datetime.now() - last_fed).days
        if days_unfed > 0:
            pet['hunger'] = max(0, pet['hunger'] - 15 * days_unfed)
            if days_unfed >= 7:
                pet['is_alive'] = False
        return pet
    
    def save_user_data(self):
        """Save user data to JSON file"""
        try:
            os.makedirs('fe', exist_ok=True)
            with open('fe/user_data.json', 'w') as f:
                json.dump(self.user_data, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def create_main_interface(self):
        """Create the main application interface"""
        # Main container
        self.main_frame = tk.Frame(self.root, bg=self.colors['black'])
        self.main_frame.pack(fill='both', expand=True)
        
        # Navigation sidebar
        self.create_sidebar()
        
        # Content area
        self.content_frame = tk.Frame(self.main_frame, bg=self.colors['black'])
        self.content_frame.pack(side='right', fill='both', expand=True, padx=20, pady=20)
        
        # Show Task & Focus by default
        self.show_focus()
    
    def create_sidebar(self):
        """Create navigation sidebar"""
        sidebar = tk.Frame(self.main_frame, bg=self.colors['dark_gray'], width=250)
        sidebar.pack(side='left', fill='y', padx=(0, 20))
        sidebar.pack_propagate(False)
        
        # App title
        title_label = tk.Label(sidebar, text="🌸 BLOSSOM", 
                              font=('Orbitron', 16, 'bold'),
                              fg=self.colors['hot_pink'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(30, 40))
        
        # User stats
        stats_frame = tk.Frame(sidebar, bg=self.colors['dark_gray'])
        stats_frame.pack(fill='x', padx=20, pady=(0, 30))
        
        level_label = tk.Label(stats_frame, text=f"Level {self.user_data['level']}", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['electric_blue'], 
                              bg=self.colors['dark_gray'])
        level_label.pack()
        
        xp_label = tk.Label(stats_frame, text=f"XP: {self.user_data['xp']}", 
                           font=('Montserrat', 10),
                           fg=self.colors['white'], 
                           bg=self.colors['dark_gray'])
        xp_label.pack()
        
        streak_label = tk.Label(stats_frame, text=f"🔥 Streak: {self.user_data['streak']} days", 
                               font=('Montserrat', 10),
                               fg=self.colors['neon_purple'], 
                               bg=self.colors['dark_gray'])
        streak_label.pack()
        
        # Navigation buttons
        nav_buttons = [
            ("⏰ Task & Focus", "focus"),
            ("🐾 My Pets", "pet"),
            ("📊 Analytics", "analytics"),
            ("⚙️ Settings", "settings")
        ]
        
        for text, page in nav_buttons:
            btn = tk.Button(sidebar, text=text, 
                           font=('Montserrat', 11, 'bold'),
                           fg=self.colors['white'],
                           bg=self.colors['light_gray'],
                           activebackground=self.colors['hot_pink'],
                           activeforeground=self.colors['white'],
                           border=0,
                           pady=15,
                           command=lambda p=page: self.switch_page(p))
            btn.pack(fill='x', padx=20, pady=5)
    
    def switch_page(self, page):
        """Switch between different pages"""
        self.current_page = page
        # Clear content frame
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        # Show appropriate page
        if page == "focus":
            self.show_focus()
        elif page == "pet":
            self.show_pet()
        elif page == "analytics":
            self.show_analytics()
        elif page == "settings":
            self.show_settings()
    
    # Removed show_dashboard and related dashboard code
    
    def show_focus(self):
        """Show Task & Focus page: timer and task manager together"""
        # Page title
        title = tk.Label(self.content_frame, text="⏰ TASK & FOCUS", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['neon_purple'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        # Main container: horizontal split (timer | task manager)
        main_frame = tk.Frame(self.content_frame, bg=self.colors['black'])
        main_frame.pack(fill='both', expand=True)

        # Timer section (left)
        timer_frame = tk.Frame(main_frame, bg=self.colors['dark_gray'])
        timer_frame.pack(side='left', fill='y', expand=True, padx=20, pady=20)

        self.timer_display = tk.Label(timer_frame, text="25:00", 
                                     font=('Orbitron', 48, 'bold'),
                               fg=self.colors['electric_blue'], 
                               bg=self.colors['dark_gray'])
        self.timer_display.pack(padx=50, pady=30)

        controls_frame = tk.Frame(timer_frame, bg=self.colors['dark_gray'])
        controls_frame.pack(pady=20)
        self.start_btn = ttk.Button(controls_frame, text="🎯 Start Focus", style='Neon.TButton', command=self.start_timer)
        self.start_btn.pack(side='left', padx=10)
        self.pause_btn = ttk.Button(controls_frame, text="⏸️ Pause", style='Electric.TButton', command=self.pause_timer)
        self.pause_btn.pack(side='left', padx=10)
        self.reset_btn = ttk.Button(controls_frame, text="🔄 Reset", style='Purple.TButton', command=self.reset_timer)
        self.reset_btn.pack(side='left', padx=10)

        length_frame = tk.Frame(timer_frame, bg=self.colors['dark_gray'])
        length_frame.pack(pady=30)
        length_label = tk.Label(length_frame, text="Session Length:", font=('Montserrat', 12, 'bold'), fg=self.colors['white'], bg=self.colors['dark_gray'])
        length_label.pack()
        lengths = [("25 min", 25), ("45 min", 45), ("60 min", 60)]
        for text, minutes in lengths:
            btn = tk.Button(length_frame, text=text, font=('Montserrat', 10), fg=self.colors['white'], bg=self.colors['light_gray'], command=lambda m=minutes: self.set_timer_length(m))
            btn.pack(side='left', padx=5)
        
        # Task manager section (right)
        task_frame = tk.Frame(main_frame, bg=self.colors['dark_gray'])
        task_frame.pack(side='left', fill='both', expand=True, padx=20, pady=20)
        
        add_title = tk.Label(task_frame, text="Add New Task", font=('Montserrat', 14, 'bold'), fg=self.colors['white'], bg=self.colors['dark_gray'])
        add_title.pack(pady=15)
        input_frame = tk.Frame(task_frame, bg=self.colors['dark_gray'])
        input_frame.pack(pady=10)
        self.task_entry = tk.Entry(input_frame, font=('Montserrat', 11), width=30, bg=self.colors['light_gray'], fg=self.colors['white'], insertbackground=self.colors['white'])
        self.task_entry.pack(side='left', padx=10)
        self.priority_var = tk.StringVar(value="medium")
        priority_frame = tk.Frame(input_frame, bg=self.colors['dark_gray'])
        priority_frame.pack(side='left', padx=10)
        for priority in ['low', 'medium', 'high']:
            rb = tk.Radiobutton(priority_frame, text=priority.capitalize(), variable=self.priority_var, value=priority, font=('Montserrat', 9), fg=self.colors['white'], bg=self.colors['dark_gray'], selectcolor=self.colors['light_gray'])
            rb.pack(side='left', padx=5)
        ttk.Button(input_frame, text="Add Task", style='Neon.TButton', command=self.add_task).pack(side='left', padx=10)
        
        # Tasks list
        tasks_container = tk.Frame(task_frame, bg=self.colors['black'])
        tasks_container.pack(fill='both', expand=True, padx=10, pady=10)
        tasks_title = tk.Label(tasks_container, text="Your Tasks", font=('Montserrat', 16, 'bold'), fg=self.colors['white'], bg=self.colors['black'])
        tasks_title.pack(pady=(0, 15))
        canvas = tk.Canvas(tasks_container, bg=self.colors['dark_gray'])
        scrollbar = ttk.Scrollbar(tasks_container, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg=self.colors['dark_gray'])
        scrollable_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        if not self.user_data['tasks']:
            no_tasks = tk.Label(scrollable_frame, text="No tasks yet! Add your first task above 🎯", font=('Montserrat', 12), fg=self.colors['electric_blue'], bg=self.colors['dark_gray'])
            no_tasks.pack(expand=True, pady=50)
        else:
            for i, task in enumerate(self.user_data['tasks']):
                self.create_task_widget(scrollable_frame, task, i)
    
    def set_timer_length(self, minutes):
        """Set focus session length"""
        self.focus_session_length = minutes * 60
        if not self.timer_running:
            self.timer_seconds = self.focus_session_length
            self.update_timer_display()
    
    def start_timer(self):
        """Start the focus timer"""
        if not self.timer_running:
            self.timer_running = True
            self.timer_thread = threading.Thread(target=self.run_timer)
            self.timer_thread.daemon = True
            self.timer_thread.start()
    
    def pause_timer(self):
        """Pause the focus timer"""
        self.timer_running = False
    
    def reset_timer(self):
        """Reset the focus timer"""
        self.timer_running = False
        self.timer_seconds = self.focus_session_length
        self.update_timer_display()
    
    def run_timer(self):
        """Run the timer in a separate thread"""
        while self.timer_running and self.timer_seconds > 0:
            time.sleep(1)
            if self.timer_running:
                self.timer_seconds -= 1
                self.root.after(0, self.update_timer_display)
        
        if self.timer_seconds <= 0:
            self.root.after(0, self.timer_finished)
    
    def update_timer_display(self):
        """Update the timer display"""
        minutes = self.timer_seconds // 60
        seconds = self.timer_seconds % 60
        time_text = f"{minutes:02d}:{seconds:02d}"
        self.timer_display.config(text=time_text)
    
    def timer_finished(self):
        """Handle timer completion"""
        self.timer_running = False
        self.user_data['focus_sessions'] += 1
        self.user_data['total_focus_time'] += self.focus_session_length // 60
        self.user_data['xp'] += 25
        self.user_data['pet_happiness'] = min(100, self.user_data['pet_happiness'] + 10)
        
        # Level up check
        if self.user_data['xp'] >= self.user_data['level'] * 100:
            self.user_data['level'] += 1
            messagebox.showinfo("Level Up!", f"🎉 Congratulations! You reached Level {self.user_data['level']}!")
        
        self.save_user_data()
        messagebox.showinfo("Focus Session Complete!", 
                           "🎉 Great focus session! +25 XP earned!\n🐾 Your pet is happy!")
        
        # Reset timer
        self.timer_seconds = self.focus_session_length
        self.update_timer_display()
    
    def get_pet_emoji(self):
        pet_type = self.user_data.get('pet_type', 'cat')  # default to cat
        pet_age = self.user_data.get('pet_age', 0)  # in years
        is_alive = self.user_data.get('pet_is_alive', True)

        # Determine stage
        if pet_age < 1:
            stage = 'baby'
        elif pet_age < 3:
            stage = 'young'
        elif pet_age < 7:
            stage = 'adult'
        else:
            stage = 'elder'

        if not is_alive:
            return '💀🐕' if pet_type == 'dog' else '💀🐱'

        if pet_type == 'dog':
            return {
                'baby': '🐶',
                'young': '🐕',
                'adult': '🐕‍🦺',
                'elder': '🦮',
            }.get(stage, '🐕')
        else:
            return {
                'baby': '🐱',
                'young': '🐈',
                'adult': '🐈‍⬛',
                'elder': '🦁',
            }.get(stage, '🐱')

    def show_pet(self):
        """Show virtual pet page"""
        pet = self.get_current_pet()
        if not pet:
            label = tk.Label(self.content_frame, text="No pet found! Adopt a new pet.", font=('Montserrat', 16, 'bold'), fg=self.colors['hot_pink'], bg=self.colors['black'])
            label.pack(pady=50)
            ttk.Button(self.content_frame, text="➕ Adopt New Pet", style='Neon.TButton', command=self.adopt_pet).pack(pady=10)
            return
        pet = self.update_pet_hunger(pet)
        self.save_current_pet(pet)
        title = tk.Label(self.content_frame, text="🐾 YOUR PET", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['hot_pink'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        pet_frame = tk.Frame(self.content_frame, bg=self.colors['dark_gray'], relief='raised', bd=2)
        pet_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Pet avatar (emoji)
        avatar = self.get_pet_emoji_pet(pet)
        pet_avatar = tk.Label(pet_frame, text=avatar, font=('Montserrat', 64), fg=self.colors['hot_pink'], bg=self.colors['dark_gray'])
        pet_avatar.pack(pady=20)
        
        # Pet name
        name_label = tk.Label(pet_frame, text=f"Name: {pet['name']}", font=('Montserrat', 16, 'bold'), fg=self.colors['electric_blue'], bg=self.colors['dark_gray'])
        name_label.pack(pady=10)
        
        # Pet type and age
        type_label = tk.Label(pet_frame, text=f"Type: {pet['type'].title()}  |  Age: {pet['age']} yrs", font=('Montserrat', 14), fg=self.colors['neon_purple'], bg=self.colors['dark_gray'])
        type_label.pack(pady=5)

        # Pet level and XP
        level_label = tk.Label(pet_frame, text=f"Level: {pet['level']}  |  XP: {pet['xp']}", font=('Montserrat', 14), fg=self.colors['neon_purple'], bg=self.colors['dark_gray'])
        level_label.pack(pady=5)
        
        # Pet happiness bar
        happiness_label = tk.Label(pet_frame, text=f"Happiness: {pet['happiness']}%", font=('Montserrat', 14, 'bold'), fg=self.colors['hot_pink'], bg=self.colors['dark_gray'])
        happiness_label.pack(pady=10)
        happiness_bar = ttk.Progressbar(pet_frame, length=400, value=pet['happiness'], maximum=100)
        happiness_bar.pack(pady=5)

        # Pet hunger bar
        hunger_label = tk.Label(pet_frame, text=f"Hunger: {pet['hunger']}%", font=('Montserrat', 14, 'bold'), fg=self.colors['electric_blue'], bg=self.colors['dark_gray'])
        hunger_label.pack(pady=10)
        hunger_bar = ttk.Progressbar(pet_frame, length=400, value=pet['hunger'], maximum=100)
        hunger_bar.pack(pady=5)
        if pet['hunger'] < 30 and pet['is_alive']:
            warning = tk.Label(pet_frame, text="Feed your pet soon!", font=('Montserrat', 12, 'bold'), fg=self.colors['hot_pink'], bg=self.colors['dark_gray'])
            warning.pack(pady=5)
        if not pet['is_alive']:
            dead_label = tk.Label(pet_frame, text="Your pet has died from hunger...", font=('Montserrat', 14, 'bold'), fg=self.colors['hot_pink'], bg=self.colors['dark_gray'])
            dead_label.pack(pady=10)
        
        # Pet mood
        if pet['happiness'] >= 80:
            mood = "😊 Very Happy!"
        elif pet['happiness'] >= 60:
            mood = "😌 Content"
        elif pet['happiness'] >= 40:
            mood = "😐 Neutral"
        else:
            mood = "😢 Needs attention"
        mood_label = tk.Label(pet_frame, text=f"Mood: {mood}", font=('Montserrat', 12), fg=self.colors['white'], bg=self.colors['dark_gray'])
        mood_label.pack(pady=10)

        # Actions (Feed, Play, Rename, Adopt)
        actions_frame = tk.Frame(pet_frame, bg=self.colors['dark_gray'])
        actions_frame.pack(pady=20)
        ttk.Button(actions_frame, text="🍖 Feed", style='Neon.TButton', command=lambda: self.feed_pet(pet)).pack(side='left', padx=10)
        ttk.Button(actions_frame, text="🎲 Play", style='Electric.TButton', command=lambda: self.play_with_pet(pet)).pack(side='left', padx=10)
        ttk.Button(actions_frame, text="✏️ Rename", style='Purple.TButton', command=lambda: self.rename_pet(pet)).pack(side='left', padx=10)
        ttk.Button(actions_frame, text="➕ Adopt New Pet", style='Neon.TButton', command=self.adopt_pet).pack(side='left', padx=10)

        # Switch pets if more than one
        if len(self.user_data['pets']) > 1:
            switch_frame = tk.Frame(pet_frame, bg=self.colors['dark_gray'])
            switch_frame.pack(pady=10)
            tk.Label(switch_frame, text="Switch Pet:", font=('Montserrat', 12), fg=self.colors['white'], bg=self.colors['dark_gray']).pack(side='left')
            for p in self.user_data['pets']:
                btn = tk.Button(switch_frame, text=p['name'], font=('Montserrat', 10), fg=self.colors['hot_pink'] if p['id']==self.user_data['current_pet_id'] else self.colors['white'], bg=self.colors['light_gray'], command=lambda pid=p['id']: self.switch_pet(pid))
                btn.pack(side='left', padx=5)

    def get_pet_emoji_pet(self, pet):
        pet_type = pet.get('type', 'cat')
        pet_age = pet.get('age', 0)
        is_alive = pet.get('is_alive', True)
        if pet_age < 1:
            stage = 'baby'
        elif pet_age < 3:
            stage = 'young'
        elif pet_age < 7:
            stage = 'adult'
        else:
            stage = 'elder'
        if not is_alive:
            return '💀🐕' if pet_type == 'dog' else '💀🐱'
        if pet_type == 'dog':
            return {'baby': '🐶','young': '🐕','adult': '🐕‍🦺','elder': '🦮'}.get(stage, '🐕')
        else:
            return {'baby': '🐱','young': '🐈','adult': '🐈‍⬛','elder': '🦁'}.get(stage, '🐱')

    def feed_pet(self, pet):
        if not pet['is_alive']:
            messagebox.showinfo("Pet is Dead", "You can't feed a dead pet. Adopt a new one!")
            return
        pet['hunger'] = 100
        pet['last_fed'] = datetime.now().strftime('%Y-%m-%d')
        pet['happiness'] = min(100, pet['happiness'] + 10)
        self.save_current_pet(pet)
        self.switch_page("pet")

    def play_with_pet(self, pet):
        if not pet['is_alive']:
            messagebox.showinfo("Pet is Dead", "You can't play with a dead pet. Adopt a new one!")
            return
        pet['happiness'] = min(100, pet['happiness'] + 5)
        pet['xp'] += 10
        if pet['xp'] >= pet['level'] * 50:
            pet['level'] += 1
            pet['xp'] = 0
            messagebox.showinfo("Pet Level Up!", f"Your pet reached Level {pet['level']}! 🐾")
        self.save_current_pet(pet)
        self.switch_page("pet")

    def rename_pet(self, pet):
        if not pet['is_alive']:
            messagebox.showinfo("Pet is Dead", "You can't rename a dead pet. Adopt a new one!")
            return
        new_name = tk.simpledialog.askstring("Rename Pet", "Enter a new name for your pet:")
        if new_name:
            pet['name'] = new_name
            self.save_current_pet(pet)
            self.switch_page("pet")

    def adopt_pet(self):
        import os
        pet_type = tk.simpledialog.askstring("Adopt Pet", "Enter pet type (cat/dog):")
        if pet_type not in ['cat', 'dog']:
            messagebox.showinfo("Invalid Type", "Please enter 'cat' or 'dog'.")
            return
        pet_name = tk.simpledialog.askstring("Adopt Pet", "Enter pet name:")
        if not pet_name:
            pet_name = 'Blossom'
        new_id = max([p['id'] for p in self.user_data.get('pets', [])]+[0]) + 1
        new_pet = {
            'id': new_id,
            'name': pet_name,
            'type': pet_type,
            'age': 0,
            'level': 1,
            'xp': 0,
            'happiness': 100,
            'hunger': 100,
            'last_fed': datetime.now().strftime('%Y-%m-%d'),
            'is_alive': True
        }
        if 'pets' not in self.user_data:
            self.user_data['pets'] = []
        self.user_data['pets'].append(new_pet)
        self.user_data['current_pet_id'] = new_id
        # Ensure fe/ directory exists
        os.makedirs('fe', exist_ok=True)
        try:
            self.save_user_data()
            print("Pet adopted and saved:", new_pet)
            print("All pets:", self.user_data['pets'])
        except Exception as e:
            print("Error saving user data:", e)
            messagebox.showerror("Error", f"Could not save pet: {e}")
        self.switch_page("pet")

    def switch_pet(self, pet_id):
        self.user_data['current_pet_id'] = pet_id
        self.save_user_data()
        self.switch_page("pet")
    
    def show_analytics(self):
        """Show analytics page"""
        # Page title
        title = tk.Label(self.content_frame, text="📊 ANALYTICS", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['electric_blue'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        # Stats grid
        stats_frame = tk.Frame(self.content_frame, bg=self.colors['black'])
        stats_frame.pack(fill='x', padx=20, pady=20)
        
        # Create analytics cards
        self.create_analytics_card(stats_frame, "Total XP", 
                                  str(self.user_data['xp']), 
                                  self.colors['hot_pink'], 0, 0)
        
        self.create_analytics_card(stats_frame, "Current Level", 
                                  str(self.user_data['level']), 
                                  self.colors['electric_blue'], 0, 1)
        
        self.create_analytics_card(stats_frame, "Tasks Completed", 
                                  str(self.user_data['completed_tasks']), 
                                  self.colors['neon_purple'], 1, 0)
        
        self.create_analytics_card(stats_frame, "Focus Sessions", 
                                  str(self.user_data['focus_sessions']), 
                                  self.colors['hot_pink'], 1, 1)
        
        self.create_analytics_card(stats_frame, "Focus Time (min)", 
                                  str(self.user_data['total_focus_time']), 
                                  self.colors['electric_blue'], 2, 0)
        
        self.create_analytics_card(stats_frame, "Current Streak", 
                                  f"{self.user_data['streak']} days", 
                                  self.colors['neon_purple'], 2, 1)
        
        # Achievements section
        achievements_frame = tk.Frame(self.content_frame, bg=self.colors['dark_gray'])
        achievements_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        achievements_title = tk.Label(achievements_frame, text="🏆 Achievements", 
                                     font=('Montserrat', 16, 'bold'),
                                     fg=self.colors['white'], 
                                     bg=self.colors['dark_gray'])
        achievements_title.pack(pady=15)
        
        # Sample achievements
        achievements = [
            ("🎯", "First Task", "Complete your first task", self.user_data['completed_tasks'] > 0),
            ("⏰", "Focus Master", "Complete 10 focus sessions", self.user_data['focus_sessions'] >= 10),
            ("🌸", "Garden Lover", "Reach 50% garden progress", self.user_data['garden_progress'] >= 50),
            ("🔥", "Streak Keeper", "Maintain a 7-day streak", self.user_data['streak'] >= 7),
            ("⭐", "Level Up", "Reach Level 5", self.user_data['level'] >= 5)
        ]
        
        for icon, name, desc, unlocked in achievements:
            self.create_achievement_widget(achievements_frame, icon, name, desc, unlocked)
    
    def create_analytics_card(self, parent, title, value, color, row, col):
        """Create an analytics card"""
        card = tk.Frame(parent, bg=self.colors['dark_gray'], relief='raised', bd=2)
        card.grid(row=row, column=col, padx=15, pady=10, sticky='ew')
        parent.grid_columnconfigure(col, weight=1)
        
        value_label = tk.Label(card, text=value, 
                              font=('Orbitron', 18, 'bold'),
                              fg=color, 
                              bg=self.colors['dark_gray'])
        value_label.pack(pady=(15, 5))
        
        title_label = tk.Label(card, text=title, 
                              font=('Montserrat', 10),
                              fg=self.colors['white'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(0, 15))
    
    def create_achievement_widget(self, parent, icon, name, desc, unlocked):
        """Create an achievement widget"""
        achievement_frame = tk.Frame(parent, bg=self.colors['light_gray'] if unlocked else self.colors['dark_gray'])
        achievement_frame.pack(fill='x', padx=20, pady=5)
        
        # Icon
        icon_label = tk.Label(achievement_frame, text=icon if unlocked else "🔒", 
                             font=('Montserrat', 16),
                             fg=self.colors['white'], 
                             bg=self.colors['light_gray'] if unlocked else self.colors['dark_gray'])
        icon_label.pack(side='left', padx=15, pady=10)
        
        # Text
        text_frame = tk.Frame(achievement_frame, bg=self.colors['light_gray'] if unlocked else self.colors['dark_gray'])
        text_frame.pack(side='left', fill='x', expand=True, padx=10, pady=10)
        
        name_label = tk.Label(text_frame, text=name, 
                             font=('Montserrat', 12, 'bold'),
                             fg=self.colors['white'] if unlocked else self.colors['light_gray'], 
                             bg=self.colors['light_gray'] if unlocked else self.colors['dark_gray'])
        name_label.pack(anchor='w')
        
        desc_label = tk.Label(text_frame, text=desc, 
                             font=('Montserrat', 9),
                             fg=self.colors['white'] if unlocked else self.colors['light_gray'], 
                             bg=self.colors['light_gray'] if unlocked else self.colors['dark_gray'])
        desc_label.pack(anchor='w')
        
        # Status
        status_text = "✓ UNLOCKED" if unlocked else "LOCKED"
        status_color = self.colors['electric_blue'] if unlocked else self.colors['light_gray']
        
        status_label = tk.Label(achievement_frame, text=status_text, 
                               font=('Montserrat', 9, 'bold'),
                               fg=status_color, 
                               bg=self.colors['light_gray'] if unlocked else self.colors['dark_gray'])
        status_label.pack(side='right', padx=15, pady=10)
    
    def show_settings(self):
        """Show settings page"""
        # Page title
        title = tk.Label(self.content_frame, text="⚙️ SETTINGS", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['neon_purple'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        # Settings sections
        settings_frame = tk.Frame(self.content_frame, bg=self.colors['dark_gray'])
        settings_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Theme section
        theme_frame = tk.Frame(settings_frame, bg=self.colors['dark_gray'])
        theme_frame.pack(fill='x', padx=20, pady=20)
        
        theme_title = tk.Label(theme_frame, text="🎨 Theme", 
                              font=('Montserrat', 16, 'bold'),
                              fg=self.colors['white'], 
                              bg=self.colors['dark_gray'])
        theme_title.pack(pady=(0, 10))
        
        theme_desc = tk.Label(theme_frame, text="Current: Neon Garden (Default)", 
                             font=('Montserrat', 11),
                             fg=self.colors['electric_blue'], 
                             bg=self.colors['dark_gray'])
        theme_desc.pack()
        
        # Data section
        data_frame = tk.Frame(settings_frame, bg=self.colors['dark_gray'])
        data_frame.pack(fill='x', padx=20, pady=20)
        
        data_title = tk.Label(data_frame, text="💾 Data Management", 
                             font=('Montserrat', 16, 'bold'),
                             fg=self.colors['white'], 
                             bg=self.colors['dark_gray'])
        data_title.pack(pady=(0, 10))
        
        # Data buttons
        buttons_frame = tk.Frame(data_frame, bg=self.colors['dark_gray'])
        buttons_frame.pack()
        
        ttk.Button(buttons_frame, text="📤 Export Data", 
                  style='Electric.TButton',
                  command=self.export_data).pack(side='left', padx=10)
        
        ttk.Button(buttons_frame, text="🔄 Reset Progress", 
                  style='Neon.TButton',
                  command=self.reset_progress).pack(side='left', padx=10)
        
        # About section
        about_frame = tk.Frame(settings_frame, bg=self.colors['dark_gray'])
        about_frame.pack(fill='x', padx=20, pady=20)
        
        about_title = tk.Label(about_frame, text="ℹ️ About", 
                              font=('Montserrat', 16, 'bold'),
                              fg=self.colors['white'], 
                              bg=self.colors['dark_gray'])
        about_title.pack(pady=(0, 10))
        
        about_text = tk.Label(about_frame, 
                             text="Blossom Focus: Tech-Girly Edition v1.0\nA productivity app with style! 🌸✨", 
                             font=('Montserrat', 11),
                             fg=self.colors['electric_blue'], 
                             bg=self.colors['dark_gray'],
                             justify='center')
        about_text.pack()
    
    def export_data(self):
        """Export user data"""
        try:
            import json
            from tkinter import filedialog
            
            filename = filedialog.asksaveasfilename(
                defaultextension=".json",
                filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
            )
            
            if filename:
                with open(filename, 'w') as f:
                    json.dump(self.user_data, f, indent=2)
                messagebox.showinfo("Success", "Data exported successfully! 📤")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export data: {e}")
    
    def reset_progress(self):
        """Reset all progress"""
        if messagebox.askyesno("Reset Progress", 
                              "Are you sure you want to reset ALL progress?\nThis cannot be undone!"):
            self.user_data = {
                'level': 1,
                'xp': 0,
                'streak': 0,
                'tasks': [],
                'completed_tasks': 0,
                'focus_sessions': 0,
                'total_focus_time': 0,
                'pet_level': 1,
                'pet_xp': 0,
                'pet_name': 'Blossom',
                'pet_avatar': '(=^･ω･^=)',
                'pet_happiness': 100,
                'achievements': [],
                'theme': 'neon_garden'
            }
            self.save_user_data()
            messagebox.showinfo("Reset Complete", "All progress has been reset! 🔄")
            self.switch_page("focus") # Changed to "focus"
    
    def run(self):
        """Start the application"""
        self.root.mainloop()

if __name__ == "__main__":
    # Import required modules
    try:
        import tkinter.simpledialog
        import tkinter.filedialog
    except ImportError:
        pass
    
    app = BlossomFocusApp()
    app.run()
