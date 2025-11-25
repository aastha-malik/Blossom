import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from datetime import datetime, timedelta
import threading
import time
import requests
import hashlib

class BlossomFocusApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Blossom Focus: Tech-Girly Edition")
        self.root.geometry("1500x900")
        self.root.configure(bg='#18181A')
        
        # App state
        self.current_page = "focus" # Changed to "focus"
        self.user_data = self.load_user_data()
        self.timer_running = False
        self.timer_seconds = 0
        self.focus_session_length = 25 * 60  # 25 minutes default
        
        # Authentication state
        self.is_logged_in = False
        self.current_username = None
        self.current_email = None
        self.auth_token = None
        self.backend_url = "http://localhost:8000"  # Backend API URL
        
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
            'xp': 0,
            'hunger': 100,
            'last_fed': datetime.now().strftime('%Y-%m-%d'),
            'is_alive': True
        }
        return {
            'pets': [],
            'current_pet_id': 0,
            'xp': 0,  # Default XP is 0 when not logged in
            'streak': 0,
            'tasks': [],
            'completed_tasks': 0,
            'focus_sessions': 0,
            'total_focus_time': 0,
            'achievements': [],
            'theme': 'neon_garden'
        }

    def get_current_pet(self):
        """Get current pet - from backend if logged in, otherwise return None"""
        if not self.is_logged_in or not self.auth_token:
            return None
        
        pets = self.fetch_pets_from_backend()
        if pets:
            # Convert backend format to local format
            converted_pets = []
            for p in pets:
                # Handle last_fed - backend returns datetime, convert to string
                last_fed = p.get('last_fed')
                if isinstance(last_fed, str):
                    last_fed_str = last_fed.split('T')[0]  # Extract date from ISO format
                elif hasattr(last_fed, 'strftime'):
                    last_fed_str = last_fed.strftime('%Y-%m-%d')
                else:
                    last_fed_str = datetime.now().strftime('%Y-%m-%d')
                
                converted_pets.append({
                    'id': p.get('id'),
                    'name': p.get('name'),
                    'type': p.get('type'),
                    'age': p.get('age', 0),
                    'xp': 0,  # XP not in backend schema
                    'hunger': p.get('hunger', 100),
                    'last_fed': last_fed_str,
                    'is_alive': p.get('is_alive', True)
                })
            # Return first pet (or could use current_pet_id if stored)
            return converted_pets[0] if converted_pets else None
        return None

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
        
        # Fetch XP from backend if logged in, otherwise show 0
        if self.is_logged_in and self.auth_token:
            backend_xp = self.fetch_user_xp_from_backend()
            self.user_data['xp'] = backend_xp
        else:
            self.user_data['xp'] = 0
        
        self.xp_label = tk.Label(stats_frame, text=f"XP: {self.user_data['xp']}", 
                           font=('Montserrat', 10),
                           fg=self.colors['white'], 
                           bg=self.colors['dark_gray'])
        self.xp_label.pack()
        
        self.streak_label = tk.Label(stats_frame, text=f"🔥 Streak: {self.user_data['streak']} days", 
                               font=('Montserrat', 10),
                               fg=self.colors['neon_purple'], 
                               bg=self.colors['dark_gray'])
        self.streak_label.pack()
        
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
    
    def update_sidebar_stats(self):
        """Update the sidebar statistics display"""
        # If logged in, fetch XP from backend
        if self.is_logged_in and self.auth_token:
            backend_xp = self.fetch_user_xp_from_backend()
            self.user_data['xp'] = backend_xp
        else:
            # If not logged in, XP should be 0
            self.user_data['xp'] = 0
        
        if hasattr(self, 'xp_label'):
            self.xp_label.config(text=f"XP: {self.user_data['xp']}")
        if hasattr(self, 'streak_label'):
            self.streak_label.config(text=f"🔥 Streak: {self.user_data['streak']} days")
    
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
        
        # Load tasks - from backend if logged in, otherwise show empty
        tasks = []
        if self.is_logged_in and self.auth_token:
            backend_tasks = self.fetch_tasks_from_backend()
            # Convert backend format to local format for display
            for bt in backend_tasks:
                tasks.append({
                    'id': bt.get('id'),
                    'text': bt.get('title', ''),
                    'priority': bt.get('priority', 'medium'),
                    'completed': bt.get('completed', False)
                })
        # If not logged in, tasks list stays empty
        
        if not tasks:
            no_tasks = tk.Label(scrollable_frame, text="No tasks yet! Add your first task above 🎯", font=('Montserrat', 12), fg=self.colors['electric_blue'], bg=self.colors['dark_gray'])
            no_tasks.pack(expand=True, pady=50)
        else:
            # Sort tasks: incomplete first, then completed (at bottom)
            sorted_tasks = sorted(tasks, key=lambda t: t.get('completed', False))
            for i, task in enumerate(sorted_tasks):
                self.create_task_widget(scrollable_frame, task, i)
    
    def set_timer_length(self, minutes):
        """Set focus session length"""
        self.focus_session_length = minutes * 60
        if not self.timer_running:
            self.timer_seconds = self.focus_session_length
            self.update_timer_display()
    
    def start_timer(self):
        """Start the focus timer"""
        # Check if logged in
        if not self.is_logged_in or not self.auth_token:
            self.show_login_required_popup("use the focus timer")
            return
        
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
        
        # Only update stats if logged in
        if self.is_logged_in and self.auth_token:
            self.user_data['focus_sessions'] += 1
            self.user_data['total_focus_time'] += self.focus_session_length // 60
            # XP is managed by backend, so we'll fetch it after timer completion
            self.save_user_data()
            self.update_sidebar_stats()  # This will fetch XP from backend
            messagebox.showinfo("Focus Session Complete!", 
                               "🎉 Great focus session! +25 XP earned!")
        else:
            # Should not reach here if login check is in start_timer, but just in case
            messagebox.showwarning("Not Logged In", "Please log in to track your focus sessions!")
        
        # Reset timer
        self.timer_seconds = self.focus_session_length
        self.update_timer_display()
    
    def add_task(self):
        """Add a new task to the task list"""
        # Check if logged in
        if not self.is_logged_in or not self.auth_token:
            self.show_login_required_popup("add tasks")
            return
        
        task_text = self.task_entry.get().strip()
        
        if not task_text:
            messagebox.showwarning("Empty Task", "Please enter a task description!")
            return
        
        priority = self.priority_var.get()
        
        # Add task to backend
        task_data = self.add_task_to_backend(task_text, priority)
        if task_data:
            messagebox.showinfo("Success", "Task added successfully!")
            self.task_entry.delete(0, tk.END)
            self.switch_page('focus')
        else:
            messagebox.showerror("Error", "Failed to add task to backend!")
    
    def create_task_widget(self, parent, task, index):
        """Create a widget for displaying a single task"""
        # Determine priority color
        priority_colors = {
            'low': self.colors['electric_blue'],
            'medium': self.colors['neon_purple'],
            'high': self.colors['hot_pink']
        }
        priority_color = priority_colors.get(task['priority'], self.colors['white'])
        
        # Task frame
        task_frame = tk.Frame(parent, bg=self.colors['light_gray'], relief='raised', bd=1)
        task_frame.pack(fill='x', padx=10, pady=5)
        
        # Checkbox
        var = tk.BooleanVar(value=task['completed'])
        checkbox = tk.Checkbutton(task_frame, variable=var, 
                                  bg=self.colors['light_gray'],
                                  activebackground=self.colors['light_gray'],
                                  command=lambda task_id=task['id']: self.complete_task(task_id))
        checkbox.pack(side='left', padx=10, pady=8)
        
        # Task text
        text_color = '#808080' if task['completed'] else self.colors['white']
        font_style = ('Montserrat', 11, 'overstrike') if task['completed'] else ('Montserrat', 11)
        
        task_label = tk.Label(task_frame, text=task['text'], 
                             font=font_style,
                             fg=text_color,
                             bg=self.colors['light_gray'],
                             anchor='w')
        task_label.pack(side='left', fill='x', expand=True, padx=10, pady=8)
        
        # Priority badge
        priority_badge = tk.Label(task_frame, 
                                 text=task['priority'].upper(),
                                 font=('Montserrat', 8, 'bold'),
                                 fg=self.colors['white'],
                                 bg=priority_color,
                                 padx=8, pady=4)
        priority_badge.pack(side='left', padx=5)
        
        # Delete button
        delete_btn = tk.Button(task_frame, text="❌", 
                              font=('Montserrat', 10),
                              fg=self.colors['hot_pink'],
                              bg=self.colors['light_gray'],
                              border=0,
                              command=lambda task_id=task['id']: self.delete_task(task_id))
        delete_btn.pack(side='left', padx=10, pady=8)
    
    def complete_task(self, task_id):
        """Toggle task completion status and award XP"""
        # If logged in, use backend
        if self.is_logged_in and self.auth_token:
            # First get current task status
            tasks = self.fetch_tasks_from_backend()
            task = None
            for t in tasks:
                if t.get('id') == task_id:
                    task = t
                    break
            
            if not task:
                messagebox.showerror("Error", "Task not found!")
                return
            
            # Toggle completion status
            new_completed = not task.get('completed', False)
            task_data = self.update_task_completed_backend(task_id, new_completed)
            
            if task_data:
                # Get XP from backend response
                backend_xp = task_data.get('userXP')
                if backend_xp is not None:
                    self.user_data['xp'] = backend_xp
                
                # Award XP if completing
                if new_completed:
                    xp_gained = task_data.get('xpReward', 0)
                    self.user_data['completed_tasks'] += 1
                    messagebox.showinfo("Task Completed!", 
                                      f"✅ Great job! +{xp_gained} XP earned!")
                self.save_user_data()
                self.update_sidebar_stats()
                self.switch_page('focus')
            else:
                messagebox.showerror("Error", "Failed to update task!")
        else:
            # Local storage (not logged in)
            task = None
            for t in self.user_data['tasks']:
                if t['id'] == task_id:
                    task = t
                    break
            
            if not task:
                return
            
            was_completed = task['completed']
            task['completed'] = not was_completed
            
            if task['completed'] and not was_completed:
                xp_rewards = {'low': 10, 'medium': 15, 'high': 25}
                xp_gained = xp_rewards.get(task['priority'], 10)
                self.user_data['xp'] += xp_gained
                self.user_data['completed_tasks'] += 1
                messagebox.showinfo("Task Completed!", 
                                  f"✅ Great job! +{xp_gained} XP earned!")
            
            self.save_user_data()
            self.update_sidebar_stats()
            self.switch_page('focus')
    
    def delete_task(self, task_id):
        """Delete a task from the list"""
        # If logged in, use backend
        if self.is_logged_in and self.auth_token:
            if self.delete_task_from_backend(task_id):
                messagebox.showinfo("Success", "Task deleted successfully!")
                self.switch_page('focus')
            else:
                messagebox.showerror("Error", "Failed to delete task from backend!")
        else:
            # Local storage (not logged in)
            self.user_data['tasks'] = [t for t in self.user_data['tasks'] if t['id'] != task_id]
            self.save_user_data()
            self.switch_page('focus')
    
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
        # If not logged in, show no pets
        if not self.is_logged_in or not self.auth_token:
            label = tk.Label(self.content_frame, text="Please log in to view your pets!", font=('Montserrat', 16, 'bold'), fg=self.colors['hot_pink'], bg=self.colors['black'])
            label.pack(pady=50)
            return
        
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

        # Pet XP
        xp_label = tk.Label(pet_frame, text=f"XP: {pet['xp']}", font=('Montserrat', 14), fg=self.colors['neon_purple'], bg=self.colors['dark_gray'])
        xp_label.pack(pady=5)

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

        # Actions (Feed, Adopt)
        actions_frame = tk.Frame(pet_frame, bg=self.colors['dark_gray'])
        actions_frame.pack(pady=20)
        ttk.Button(actions_frame, text="🍖 Feed", style='Neon.TButton', command=lambda: self.feed_pet(pet)).pack(side='left', padx=10)
        ttk.Button(actions_frame, text="➕ Adopt New Pet", style='Neon.TButton', command=self.adopt_pet).pack(side='left', padx=10)

        # Switch pets if more than one
        pets_list = []
        if self.is_logged_in and self.auth_token:
            backend_pets = self.fetch_pets_from_backend()
            for p in backend_pets:
                pets_list.append({
                    'id': p.get('id'),
                    'name': p.get('name')
                })
        else:
            pets_list = self.user_data.get('pets', [])
        
        if len(pets_list) > 1:
            switch_frame = tk.Frame(pet_frame, bg=self.colors['dark_gray'])
            switch_frame.pack(pady=10)
            tk.Label(switch_frame, text="Switch Pet:", font=('Montserrat', 12), fg=self.colors['white'], bg=self.colors['dark_gray']).pack(side='left')
            current_id = pet.get('id') if pet else None
            for p in pets_list:
                btn = tk.Button(switch_frame, text=p['name'], font=('Montserrat', 10), 
                              fg=self.colors['hot_pink'] if p['id']==current_id else self.colors['white'], 
                              bg=self.colors['light_gray'], 
                              command=lambda pid=p['id']: self.switch_pet(pid))
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
        
        # If logged in, use backend
        if self.is_logged_in and self.auth_token:
            pet_data = self.feed_pet_in_backend(pet['id'])
            if pet_data:
                messagebox.showinfo("Success", "Pet fed successfully!")
                self.switch_page("pet")
            else:
                messagebox.showerror("Error", "Failed to feed pet via backend!")
        else:
            # Local storage
            pet['hunger'] = 100
            pet['last_fed'] = datetime.now().strftime('%Y-%m-%d')
            self.save_current_pet(pet)
            self.switch_page("pet")

    def adopt_pet(self):
        # Check if logged in
        if not self.is_logged_in or not self.auth_token:
            self.show_login_required_popup("adopt pets")
            return
        
        import os
        pet_type = tk.simpledialog.askstring("Adopt Pet", "Enter pet type (cat/dog):")
        if pet_type not in ['cat', 'dog']:
            messagebox.showinfo("Invalid Type", "Please enter 'cat' or 'dog'.")
            return
        pet_name = tk.simpledialog.askstring("Adopt Pet", "Enter pet name:")
        if not pet_name:
            pet_name = 'Blossom'
        
        # Create pet in backend
        pet_data = self.create_pet_in_backend(pet_name, pet_type)
        if pet_data:
            messagebox.showinfo("Success", f"Pet {pet_name} adopted successfully!")
            self.switch_page("pet")
        else:
            messagebox.showerror("Error", "Failed to create pet in backend!")

    def switch_pet(self, pet_id):
        """Switch to a different pet"""
        if self.is_logged_in and self.auth_token:
            # For backend, we'll just refresh and show the first pet
            # (could be enhanced to store current_pet_id in backend)
            self.switch_page("pet")
        else:
            # Local storage
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
        
        # If not logged in, show zeros
        if not self.is_logged_in or not self.auth_token:
            xp_value = 0
            tasks_completed = 0
            focus_time = 0
            streak = 0
        else:
            xp_value = self.user_data.get('xp', 0)
            tasks_completed = self.user_data.get('completed_tasks', 0)
            focus_time = self.user_data.get('total_focus_time', 0)
            streak = self.user_data.get('streak', 0)
        
        # Create analytics cards
        self.create_analytics_card(stats_frame, "Total XP", 
                                  str(xp_value), 
                                  self.colors['hot_pink'], 0, 0)
        
        self.create_analytics_card(stats_frame, "Tasks Completed", 
                                  str(tasks_completed), 
                                  self.colors['neon_purple'], 0, 1)
        
        self.create_analytics_card(stats_frame, "Focus Time (min)", 
                                  str(focus_time), 
                                  self.colors['electric_blue'], 1, 0)
        
        self.create_analytics_card(stats_frame, "Current Streak", 
                                  f"{streak} days", 
                                  self.colors['neon_purple'], 1, 1)
    
    def create_analytics_card(self, parent, title, value, color, row, col):
        """Create an analytics card"""
        card = tk.Frame(parent, bg=self.colors['dark_gray'], relief='raised', bd=2)
        card.grid(row=row, column=col, padx=20, pady=20, sticky='nsew')
        parent.grid_columnconfigure(col, weight=1)
        parent.grid_rowconfigure(row, weight=1)
        card.config(width=300, height=200)
        
        value_label = tk.Label(card, text=value, 
                              font=('Orbitron', 32, 'bold'),
                              fg=color, 
                              bg=self.colors['dark_gray'])
        value_label.pack(pady=(30, 10))
        
        title_label = tk.Label(card, text=title, 
                              font=('Montserrat', 14, 'bold'),
                              fg=self.colors['white'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(0, 30))
    
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
        
        # Authentication section
        auth_frame = tk.Frame(settings_frame, bg=self.colors['dark_gray'])
        auth_frame.pack(fill='x', padx=20, pady=20)
        
        auth_title = tk.Label(auth_frame, text="🔐 Authentication", 
                             font=('Montserrat', 16, 'bold'),
                             fg=self.colors['white'], 
                             bg=self.colors['dark_gray'])
        auth_title.pack(pady=(0, 15))
        
        # Auth status
        if self.is_logged_in:
            auth_status = tk.Label(auth_frame, text=f"✅ Logged in as:\nUsername: {self.current_username}\nEmail: {self.current_email}",
                                  font=('Montserrat', 12),
                                  fg=self.colors['electric_blue'], 
                                  bg=self.colors['dark_gray'])
            auth_status.pack(pady=(0, 10))
            
            # Logout and Delete Account buttons
            auth_buttons_frame = tk.Frame(auth_frame, bg=self.colors['dark_gray'])
            auth_buttons_frame.pack(pady=5)
            
            logout_btn = ttk.Button(auth_buttons_frame, text="🚪 Logout", 
                                   style='Neon.TButton',
                                   command=self.logout)
            logout_btn.pack(side='left', padx=5)
            reset_password_btn = tk.Button(
                            auth_buttons_frame,
                            text="Reset Password?",
                            font=('Montserrat', 10),
                            fg=self.colors['electric_blue'],
                            bg=self.colors['dark_gray'],
                            border=0,
                            command=self.show_forgot_password_form)
            reset_password_btn.pack(side='left', padx=5)
            delete_account_btn = ttk.Button(auth_buttons_frame, text="🗑️ Delete Account", 
                                            style='Neon.TButton',
                                            command=self.show_delete_account_warning)
            delete_account_btn.pack(side='left', padx=5)
        else:
            auth_status = tk.Label(auth_frame, text="❌ Not logged in", 
                                  font=('Montserrat', 12),
                                  fg=self.colors['hot_pink'], 
                                  bg=self.colors['dark_gray'])
            auth_status.pack(pady=(0, 35))
            
            # Auth buttons
            auth_buttons_frame = tk.Frame(auth_frame, bg=self.colors['dark_gray'])
            auth_buttons_frame.pack(pady=10)
            
            login_btn = ttk.Button(auth_buttons_frame, text="🔑 Login", 
                                  style='Electric.TButton',
                                  command=self.show_login_form)
            login_btn.pack(side='left', padx=10)
            
            signup_btn = ttk.Button(auth_buttons_frame, text="📝 Sign Up", 
                                   style='Purple.TButton',
                                   command=self.show_signup_form)
            signup_btn.pack(side='left', padx=10)
        
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
            # Reset pets to default
            default_pet = {
                'id': 0,
                'name': 'Blossom',
                'type': 'cat',
                'age': 0,
                'xp': 0,
                'hunger': 100,
                'last_fed': datetime.now().strftime('%Y-%m-%d'),
                'is_alive': True
            }
            self.user_data = {
                'pets': [],
                'current_pet_id': 0,
                'xp': 0,  # Default XP is 0 when not logged in
                'streak': 0,
                'tasks': [],
                'completed_tasks': 0,
                'focus_sessions': 0,
                'total_focus_time': 0,
                'achievements': [],
                'theme': 'neon_garden'
            }
            self.save_user_data()
            self.update_sidebar_stats()  # Update sidebar stats
            messagebox.showinfo("Reset Complete", "All progress has been reset! 🔄")
            self.switch_page("focus") # Changed to "focus"
    
    def show_login_required_popup(self, action):
        """Show popup asking user to login or signup with custom buttons"""

        popup = tk.Toplevel()
        popup.overrideredirect(True)   # Remove OS title bar
        popup.config(bg="#1e1e1e")     # Background theme
        popup.geometry("360x200")

        # Center popup relative to main window
        popup.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - 180
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - 100
        popup.geometry(f"+{x}+{y}")

        # Outer frame
        frame = tk.Frame(popup, bg="#2b2b2b")
        frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Title row with X button
        title_frame = tk.Frame(frame, bg="#2b2b2b")
        title_frame.pack(fill="x")

        title_label = tk.Label(
            title_frame, text="Login Required",
            bg="#2b2b2b", fg="white", font=("Segoe UI", 12, "bold")
        )
        title_label.pack(side="left", padx=5, pady=5)

        close_btn = tk.Button(
            title_frame, text="✖", bg="#2b2b2b", fg="white",
            bd=0, relief="flat", font=("Segoe UI", 10, "bold"),
            command=popup.destroy, cursor="hand2"
        )
        close_btn.pack(side="right", padx=5)

        # Message text
        msg = tk.Label(
            frame,
            text=f"⚠️ You need to be logged in to {action}!\n\nChoose an option below:",
            bg="#2b2b2b", fg="#d0d0d0", justify="center",
            font=("Segoe UI", 10)
        )
        msg.pack(pady=10)

        # Buttons frame
        btn_frame = tk.Frame(frame, bg="#2b2b2b")
        btn_frame.pack(pady=10)

        btn_style = {"width": 14, "bg": "#3a3a3a", "fg": "white", "relief": "flat", "bd": 0}

        # Login button
        login_btn = tk.Button(
            btn_frame, text="Login", **btn_style,
            command=lambda: [popup.destroy(), self.show_login_form()]
        )
        login_btn.grid(row=0, column=0, padx=8)

        # Create Account button
        signup_btn = tk.Button(
            btn_frame, text="Create Account", **btn_style,
            command=lambda: [popup.destroy(), self.show_signup_form()]
        )
        signup_btn.grid(row=0, column=1, padx=8)



    
    def show_login_form(self):
        """Show login form dialog"""
        login_window = tk.Toplevel(self.root)
        login_window.title("🔑 Login")
        login_window.geometry("450x500")
        login_window.configure(bg=self.colors['black'])
        login_window.resizable(False, False)
        
        # Center the window
        login_window.transient(self.root)
        login_window.grab_set()
        
        # Login form
        login_frame = tk.Frame(login_window, bg=self.colors['dark_gray'])
        login_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Title
        title_label = tk.Label(login_frame, text="🔑 Login to Blossom", 
                              font=('Orbitron', 18, 'bold'),
                              fg=self.colors['electric_blue'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(0, 20))
        
        # Username/Email field
        tk.Label(login_frame, text="Username or Email:", 
                font=('Montserrat', 12, 'bold'),
                fg=self.colors['white'], 
                bg=self.colors['dark_gray']).pack(pady=(0, 5))
        username_entry = tk.Entry(login_frame, font=('Montserrat', 11), 
                                 bg=self.colors['light_gray'], 
                                 fg=self.colors['white'], 
                                 insertbackground=self.colors['white'])
        username_entry.pack(pady=(0, 15), ipadx=10, ipady=5)
        
        # Password field
        tk.Label(login_frame, text="Password:", 
                font=('Montserrat', 12, 'bold'),
                fg=self.colors['white'], 
                bg=self.colors['dark_gray']).pack(pady=(0, 5))
        password_entry = tk.Entry(login_frame, font=('Montserrat', 11), 
                                 bg=self.colors['light_gray'], 
                                 fg=self.colors['white'], 
                                 insertbackground=self.colors['white'],
                                 show="*")
        password_entry.pack(pady=(0, 20), ipadx=10, ipady=5)
        
        # Buttons
        button_frame = tk.Frame(login_frame, bg=self.colors['dark_gray'])
        button_frame.pack(pady=10)
        
        login_btn = tk.Button(button_frame, text="🔑 Login", 
                             font=('Montserrat', 12, 'bold'),
                             fg=self.colors['white'],
                             bg=self.colors['hot_pink'],
                             activebackground=self.colors['electric_blue'],
                             command=lambda: self.login_user(username_entry.get(), password_entry.get(), login_window))
        login_btn.pack(side='left', padx=10)
        
        forgot_btn = tk.Button(button_frame, text="Forgot Password ?", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['light_gray'],
                              activebackground=self.colors['dark_gray'],
                              command=self.show_forgot_password_form)
        forgot_btn.pack(side='left', padx=10)
        
        # Divider line
        divider_frame = tk.Frame(login_frame, bg=self.colors['dark_gray'])
        divider_frame.pack(pady=20)
        
        # Divider line
        divider = tk.Frame(divider_frame, height=1, bg=self.colors['light_gray'])
        divider.pack(fill='x')
        
        # OR text
        or_label = tk.Label(divider_frame, text="OR", 
                           font=('Montserrat', 10, 'bold'),
                           fg=self.colors['white'], 
                           bg=self.colors['dark_gray'])
        or_label.pack(pady=5)
        
        # Google login button
        google_frame = tk.Frame(login_frame, bg=self.colors['dark_gray'])
        google_frame.pack(pady=10)
        
        google_btn = tk.Button(google_frame, text="🔍 Login with Google", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg='#4285F4',  # Google blue
                              activebackground='#3367D6',
                              activeforeground=self.colors['white'],
                              border=0,
                              pady=10,
                              command=self.google_login)
        google_btn.pack(fill='x', ipadx=20)
        
        # Forgot password link
        forgot_frame = tk.Frame(login_frame, bg=self.colors['dark_gray'])
        forgot_frame.pack(pady=10)
        
        forgot_btn = tk.Button(
                            forgot_frame,
                            text="🔓 Forgot Password?",
                            font=('Montserrat', 10),
                            fg=self.colors['electric_blue'],
                            bg=self.colors['dark_gray'],
                            border=0,
                            command=self.show_password_forgot_form)

        forgot_btn.pack()
        
        # Focus on username field
        username_entry.focus()
        
        # Bind Enter key to login
        login_window.bind('<Return>', lambda e: self.login_user(username_entry.get(), password_entry.get(), login_window))
    
    def show_signup_form(self):
        """Show signup form dialog"""
        signup_window = tk.Toplevel(self.root)
        signup_window.title("📝 Sign Up")
        signup_window.geometry("450x500")
        signup_window.configure(bg=self.colors['black'])
        signup_window.resizable(False, False)
        
        # Center the window
        signup_window.transient(self.root)
        signup_window.grab_set()
        
        # Signup form
        signup_frame = tk.Frame(signup_window, bg=self.colors['dark_gray'])
        signup_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Title
        title_label = tk.Label(signup_frame, text="📝 Join Blossom", 
                              font=('Orbitron', 18, 'bold'),
                              fg=self.colors['neon_purple'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(0, 20))
        
        # Username field
        tk.Label(signup_frame, text="Username:", 
                font=('Montserrat', 12, 'bold'),
                fg=self.colors['white'], 
                bg=self.colors['dark_gray']).pack(pady=(0, 5))
        username_entry = tk.Entry(signup_frame, font=('Montserrat', 11), 
                                 bg=self.colors['light_gray'], 
                                 fg=self.colors['white'], 
                                 insertbackground=self.colors['white'])
        username_entry.pack(pady=(0, 10), ipadx=10, ipady=5)
        
        # Email field
        tk.Label(signup_frame, text="Email:", 
                font=('Montserrat', 12, 'bold'),
                fg=self.colors['white'], 
                bg=self.colors['dark_gray']).pack(pady=(0, 5))
        email_entry = tk.Entry(signup_frame, font=('Montserrat', 11), 
                              bg=self.colors['light_gray'], 
                              fg=self.colors['white'], 
                              insertbackground=self.colors['white'])
        email_entry.pack(pady=(0, 10), ipadx=10, ipady=5)
        
        # Password field
        tk.Label(signup_frame, text="Password:", 
                font=('Montserrat', 12, 'bold'),
                fg=self.colors['white'], 
                bg=self.colors['dark_gray']).pack(pady=(0, 5))
        password_entry = tk.Entry(signup_frame, font=('Montserrat', 11), 
                                 bg=self.colors['light_gray'], 
                                 fg=self.colors['white'], 
                                 insertbackground=self.colors['white'],
                                 show="*")
        password_entry.pack(pady=(0, 10), ipadx=10, ipady=5)
        
        # Confirm Password field
        tk.Label(signup_frame, text="Confirm Password:", 
                font=('Montserrat', 12, 'bold'),
                fg=self.colors['white'], 
                bg=self.colors['dark_gray']).pack(pady=(0, 5))
        confirm_password_entry = tk.Entry(signup_frame, font=('Montserrat', 11), 
                                         bg=self.colors['light_gray'], 
                                         fg=self.colors['white'], 
                                         insertbackground=self.colors['white'],
                                         show="*")
        confirm_password_entry.pack(pady=(0, 20), ipadx=10, ipady=5)
        
        # Buttons
        button_frame = tk.Frame(signup_frame, bg=self.colors['dark_gray'])
        button_frame.pack(pady=10)
        
        signup_btn = tk.Button(button_frame, text="📝 Sign Up", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['neon_purple'],
                              activebackground=self.colors['hot_pink'],
                              command=lambda: self.register_user(username_entry.get(), email_entry.get(), password_entry.get(), confirm_password_entry.get(), signup_window))
        signup_btn.pack(side='left', padx=10)
        
        cancel_btn = tk.Button(button_frame, text="❌ Cancel", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['light_gray'],
                              activebackground=self.colors['dark_gray'],
                              command=signup_window.destroy)
        cancel_btn.pack(side='left', padx=10)
        
        # Divider line
        divider_frame = tk.Frame(signup_frame, bg=self.colors['dark_gray'])
        divider_frame.pack(pady=20)
        
        # Divider line
        divider = tk.Frame(divider_frame, height=1, bg=self.colors['light_gray'])
        divider.pack(fill='x')
        
        # OR text
        or_label = tk.Label(divider_frame, text="OR", 
                           font=('Montserrat', 10, 'bold'),
                           fg=self.colors['white'], 
                           bg=self.colors['dark_gray'])
        or_label.pack(pady=5)
        
        # Google signup button
        google_frame = tk.Frame(signup_frame, bg=self.colors['dark_gray'])
        google_frame.pack(pady=10)
        
        google_btn = tk.Button(google_frame, text="🔍 Sign up with Google", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg='#4285F4',  # Google blue
                              activebackground='#3367D6',
                              activeforeground=self.colors['white'],
                              border=0,
                              pady=10,
                              command=self.google_signup)
        google_btn.pack(fill='x', ipadx=20)
        
        # Focus on username field
        username_entry.focus()
        
        # Bind Enter key to signup
        signup_window.bind('<Return>', lambda e: self.register_user(username_entry.get(), email_entry.get(), password_entry.get(), confirm_password_entry.get(), signup_window))
    
    def login_user(self, username, password, window):
        """Handle user login using backend API"""
        if not username or not password:
            messagebox.showerror("Error", "Please fill in all fields!")
            return
        try:
            login_data = {"username": username, "password": password}
            response = requests.post(f"{self.backend_url}/token", data=login_data, timeout=10)
            if response.status_code == 200:
                token_data = response.json()
                print("TOKEN DATA:", token_data)
                self.auth_token = token_data.get("access_token")
                self.current_username = token_data.get("username")
                self.current_email = token_data.get("email")
                self.is_logged_in = True

                # Fetch XP from backend after login
                backend_xp = self.fetch_user_xp_from_backend()
                self.user_data['xp'] = backend_xp
                self.save_user_data()
                self.update_sidebar_stats()  # Update sidebar with XP from backend
                messagebox.showinfo("Success", f"🎉 Welcome back, {username}!")
                window.destroy()
                self.switch_page("settings")
            else:
                messagebox.showerror("Login Failed", "Invalid username or password!")
        except requests.exceptions.ConnectionError:
            messagebox.showerror("Connection Error", "Could not connect to server. Please try again later.")
        except Exception as e:
            messagebox.showerror("Error", f"Login failed: {str(e)}")

    def register_user(self, username, email, password, confirm_password, window):
        """Handle user registration using backend API"""
        if not all([username, email, password, confirm_password]):
            messagebox.showerror("Error", "Please fill in all fields!")
            return
        if password != confirm_password:
            messagebox.showerror("Error", "Passwords do not match!")
            return
        if len(password) < 6:
            messagebox.showerror("Error", "Password must be at least 6 characters long!")
            return
        try:
            register_data = {"username": username, "password": password, "email": email}
            response = requests.post(f"{self.backend_url}/register", json=register_data, timeout=10)
            if response.ok:
                result = response.json()
                if result.get("message"):
                    messagebox.showinfo("Success", "🎉 Account created successfully! Please verify your email.")
                    window.destroy()
                    self.temp_email = email
                    self.show_email_verification_form(username, email)
                else:
                    error_detail = response.json().get("detail", "Registration failed!")
                    messagebox.showerror("Registration Failed", result.get("message", "Registration failed!"))
            else:
                result = response.json()
                error_detail = result.get("detail", "Registration failed!")
                
                # Show friendly pop-up for existing username/email
                if "already exists" in error_detail.lower() or "already taken" in error_detail.lower():
                    messagebox.showwarning("Already Exists", 
                                         f"⚠️ {error_detail}\n\n"
                                         f"Please try a different {'username' if 'username' in error_detail.lower() else 'email address'}.")
                else:
                    messagebox.showerror("Registration Failed", error_detail)
        except requests.exceptions.ConnectionError:
            messagebox.showerror("Connection Error", "Could not connect to server. Please try again later.")
        except Exception as e:
            messagebox.showerror("Error", f"Registration failed: {str(e)}")
    
    def show_email_verification_form(self, username, email):
        """Show email verification form"""
        verify_window = tk.Toplevel(self.root)
        verify_window.title("📧 Email Verification")
        verify_window.geometry("400x400")
        verify_window.configure(bg=self.colors['black'])
        verify_window.resizable(True, True)

        
        # Center the window
        verify_window.transient(self.root)
        verify_window.grab_set()
        
        # Verification form
        verify_frame = tk.Frame(verify_window, bg=self.colors['dark_gray'])
        verify_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Title
        title_label = tk.Label(verify_frame, text="📧 Email Verification", 
                              font=('Orbitron', 16, 'bold'),
                              fg=self.colors['electric_blue'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(0, 15))
        
        # Info text
        info_text = tk.Label(verify_frame, 
                            text=f"We've sent a verification code to:\n{email}\n\nPlease check your email and enter the code below:",
                            font=('Montserrat', 11),
                            fg=self.colors['white'], 
                            bg=self.colors['dark_gray'],
                            justify='center')
        info_text.pack(pady=(0, 15))
        
        # Verification code field
        code_entry = tk.Entry(verify_frame, font=('Montserrat', 12, 'bold'), 
                             bg=self.colors['light_gray'], 
                             fg=self.colors['white'], 
                             insertbackground=self.colors['white'],
                             justify='center')
        code_entry.pack(pady=(0, 15), ipadx=20, ipady=8)
        
        # Buttons
        button_frame = tk.Frame(verify_frame, bg=self.colors['dark_gray'])
        button_frame.pack(pady=10)
        
        verify_btn = tk.Button(button_frame, text="✅ Verify", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['electric_blue'],
                              activebackground=self.colors['hot_pink'],
                              command=lambda: self.verify_email(code_entry.get(), verify_window))
        verify_btn.pack(side='left', padx=10)
        
        resend_btn = tk.Button(button_frame, text="🔄 Resend", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['neon_purple'],
                              activebackground=self.colors['electric_blue'],
                              command=lambda: self.resend_verification_code(email))
        resend_btn.pack(side='left', padx=10)
        
        # Focus on code field
        code_entry.focus()
        
        # Bind Enter key to verify
        verify_window.bind('<Return>', lambda e: self.verify_email(code_entry.get(), verify_window))
    
    def verify_email(self, code, window):
        if not code:
            messagebox.showerror("Error", "Please enter the verification code!")
            return
        # ♥ the simple version
        url = f"{self.backend_url}/verify_email?email={self.temp_email}&verification_token={code}"
        try:
            response = requests.post(url)
            if response.status_code == 200:
                messagebox.showinfo("Success", "🎉 Email verified!")
                window.destroy()
                self.switch_page("settings")
            else:
                messagebox.showerror("Verification Failed", "Invalid or expired code!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def resend_verification_code(self, email):
        """Resend verification code"""
        messagebox.showinfo("Code Sent", f"📧 Verification code resent to {email}")
    
    def show_forgot_password_form(self):
        window = tk.Toplevel(self.root)
        window.title("🔑 Forgot Password")
        window.geometry("380x220")
        window.configure(bg=self.colors['black'])
        window.resizable(False, False)
        window.grab_set()

        frame = tk.Frame(window, bg=self.colors['dark_gray'])
        frame.pack(fill='both', expand=True, padx=20, pady=20)

        tk.Label(frame, text="Enter your Email:",
                font=('Montserrat', 12),
                fg=self.colors['white'], bg=self.colors['dark_gray']).pack()

        email_entry = tk.Entry(frame, font=('Montserrat', 11),
                            bg=self.colors['light_gray'], fg=self.colors['white'])
        email_entry.pack(pady=10)

    def send_otp():
        email = email_entry.get().strip()
        if not email:
            messagebox.showerror("Error", "Email is required!")
            return

        try:
            response = requests.post(
                f"{self.backend_url}/send_forgot_password_otp",
                params={"email": email},
                timeout=10
            )

            if response.status_code == 200:
                messagebox.showinfo("Success", "OTP sent to your email.")
                window.destroy()
                self.show_reset_password_form(email)
            else:
                messagebox.showerror("Error", response.json().get("detail"))
        except Exception as e:
            messagebox.showerror("Error", str(e))

    tk.Button(frame, text="📧 Send OTP", bg=self.colors['electric_blue'],
              fg="black", font=('Montserrat', 12, 'bold'),
              command=send_otp).pack(pady=10)

    tk.Button(frame, text="Cancel", bg=self.colors['light_gray'], fg="white",
              command=window.destroy).pack()


    def handle_forgot_password(self, username, otp, new_pass, confirm_pass, window):
        if not username or not otp or not new_pass or not confirm_pass:
            messagebox.showerror("Error", "Please fill all fields!")
            return

        try:
            # Make request to backend
            response = requests.patch(
                f"{self.backend_url}/forgot_password",
                params={
                    "username": username,
                    "entered_verify_code": otp,
                    "new_password": new_pass,
                    "new_password_confirm": confirm_pass
                },
                timeout=10
            )

            if response.status_code == 200:
                messagebox.showinfo("Success", "Password reset successfully!")
                window.destroy()

            else:
                error = response.json().get("detail", "Reset failed.")
                messagebox.showerror("Error", error)

        except Exception as e:
            messagebox.showerror("Error", str(e))


    
    def logout(self):
        """Handle user logout"""
        self.is_logged_in = False
        self.current_user = None
        self.auth_token = None
        messagebox.showinfo("Logged Out", "👋 You have been logged out successfully!")
        self.switch_page("settings")  # Refresh settings page
    
    def show_delete_account_warning(self):
        """Show initial warning before account deletion"""
        warning_msg = (
            "⚠️ WARNING: Account Deletion\n\n"
            "This action is PERMANENT and cannot be undone!\n\n"
            "Deleting your account will:\n"
            "• Remove all your tasks\n"
            "• Remove all your pets\n"
            "• Delete all your progress and data\n"
            "• Permanently delete your account\n\n"
            "Are you absolutely sure you want to proceed?"
        )
        
        if messagebox.askyesno("⚠️ Delete Account Warning", warning_msg, icon='warning'):
            self.show_delete_account_password_form()
    
    def show_delete_account_password_form(self):
        """Show password confirmation form for account deletion"""
        password_window = tk.Toplevel(self.root)
        password_window.title("🗑️ Delete Account - Password Confirmation")
        password_window.geometry("450x350")
        password_window.configure(bg=self.colors['black'])
        password_window.resizable(False, False)
        
        # Center the window
        password_window.transient(self.root)
        password_window.grab_set()
        
        # Password form
        password_frame = tk.Frame(password_window, bg=self.colors['dark_gray'])
        password_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Title
        title_label = tk.Label(password_frame, text="🗑️ Confirm Account Deletion", 
                              font=('Orbitron', 18, 'bold'),
                              fg=self.colors['hot_pink'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(0, 20))
        
        # Warning text
        warning_text = tk.Label(password_frame, 
                               text="⚠️ Enter your password to confirm account deletion.\nThis action cannot be undone!",
                               font=('Montserrat', 11),
                               fg=self.colors['hot_pink'], 
                               bg=self.colors['dark_gray'],
                               justify='center')
        warning_text.pack(pady=(0, 20))
        
        # Password field
        tk.Label(password_frame, text="Password:", 
                font=('Montserrat', 12, 'bold'),
                fg=self.colors['white'], 
                bg=self.colors['dark_gray']).pack(pady=(0, 5))
        password_entry = tk.Entry(password_frame, font=('Montserrat', 11), 
                                 bg=self.colors['light_gray'], 
                                 fg=self.colors['white'], 
                                 insertbackground=self.colors['white'],
                                 show="*")
        password_entry.pack(pady=(0, 20), ipadx=10, ipady=5)
        
        # Buttons
        button_frame = tk.Frame(password_frame, bg=self.colors['dark_gray'])
        button_frame.pack(pady=10)
        
        delete_btn = tk.Button(button_frame, text="🗑️ Delete Account", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['hot_pink'],
                              activebackground=self.colors['electric_blue'],
                              command=lambda: self.delete_account(password_entry.get(), password_window))
        delete_btn.pack(side='left', padx=10)
        
        cancel_btn = tk.Button(button_frame, text="❌ Cancel", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['light_gray'],
                              activebackground=self.colors['dark_gray'],
                              command=password_window.destroy)
        cancel_btn.pack(side='left', padx=10)
        
        # Focus on password field
        password_entry.focus()
        
        # Bind Enter key to delete
        password_window.bind('<Return>', lambda e: self.delete_account(password_entry.get(), password_window))
    
    def delete_account(self, password, window):
        """Delete user account after password verification"""
        if not password:
            messagebox.showerror("Error", "Please enter your password!")
            return
        
        if not self.is_logged_in or not self.auth_token:
            messagebox.showerror("Error", "You must be logged in to delete your account!")
            window.destroy()
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}", "Content-Type": "application/json"}
            response = requests.delete(f"{self.backend_url}/delete_account", 
                                     json={"password": password}, 
                                     headers=headers,
                                     timeout=10)
            
            if response.status_code == 200:
                window.destroy()
                messagebox.showinfo("Account Deleted", 
                                  "🗑️ Your account has been permanently deleted.\n\n"
                                  "All your data has been removed from our system.")
                # Logout and reset
                self.is_logged_in = False
                self.current_user = None
                self.auth_token = None
                self.switch_page("settings")
            elif response.status_code == 401:
                messagebox.showerror("Incorrect Password", 
                                   "❌ The password you entered is incorrect!\n\n"
                                   "Please try again with the correct password.")
            else:
                error_msg = response.json().get("detail", "Failed to delete account")
                messagebox.showerror("Error", f"Failed to delete account: {error_msg}")
        except requests.exceptions.ConnectionError:
            messagebox.showerror("Connection Error", 
                               "Could not connect to server. Please try again later.")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")
    
    def fetch_tasks_from_backend(self):
        """Fetch tasks from backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            response = requests.get(f"{self.backend_url}/tasks", headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                return []
        except Exception as e:
            print(f"Error fetching tasks: {e}")
            return []
    
    def fetch_user_xp_from_backend(self):
        """Fetch user XP from backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            response = requests.get(f"{self.backend_url}/user/xp", headers=headers)
            if response.status_code == 200:
                data = response.json()
                return data.get('xp', 100)  # Default to 100 if not found
            return 100
        except Exception as e:
            print(f"Error fetching XP: {e}")
            return 100

    def add_task_to_backend(self, title, priority):
        """Add a new task to backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}", "Content-Type": "application/json"} if self.auth_token else {}
            response = requests.post(f"{self.backend_url}/tasks", json={"title": title, "priority": priority}, headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error adding task: {e}")
            return None

    def update_task_completed_backend(self, task_id, completed):
        """Update task completion status in backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}", "Content-Type": "application/json"} if self.auth_token else {}
            response = requests.patch(f"{self.backend_url}/tasks/{task_id}", json={"completed": completed}, headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error updating task: {e}")
            return None

    def delete_task_from_backend(self, task_id):
        """Delete a task from backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            response = requests.delete(f"{self.backend_url}/tasks/{task_id}", headers=headers)
            return response.status_code == 200
        except Exception as e:
            print(f"Error deleting task: {e}")
            return False

    def fetch_pets_from_backend(self):
        """Fetch pets from backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            response = requests.get(f"{self.backend_url}/pet", headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                return []
        except Exception as e:
            print(f"Error fetching pets: {e}")
            return []

    def create_pet_in_backend(self, name, pet_type, age=0, hunger=100):
        """Create a new pet in backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}", "Content-Type": "application/json"} if self.auth_token else {}
            response = requests.post(f"{self.backend_url}/pets", json={"name": name, "type": pet_type, "age": age, "hunger": hunger}, headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error creating pet: {e}")
            return None
    
    def feed_pet_in_backend(self, pet_id):
        """Feed a pet via backend API"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            response = requests.patch(f"{self.backend_url}/pet/feed/{pet_id}", headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error feeding pet: {e}")
            return None

    def run(self):
        """Start the application"""
        self.root.mainloop()

    def reset_password_backend(self, username, otp, new_pass, new_pass2, window):
        if not otp or not new_pass or not new_pass2:
            messagebox.showerror("Error", "Please fill all fields!")
            return

        try:
            response = requests.patch(
            f"{self.backend_url}/forgot_password",
            params={
                "username": username,
                "entered_verify_code": otp,
                "new_password": new_pass,
                "new_password_confirm": new_pass2
            },
            timeout=10
        )

            if response.status_code == 200:
                messagebox.showinfo("Success", "Password reset successfully!")
                window.destroy()
            else:
                error = response.json().get("detail", "Reset failed.")
                messagebox.showerror("Error", error)

        except Exception as e:
            messagebox.showerror("Error", str(e))


if __name__ == "__main__":
    # Import required modules
    try:
        import tkinter.simpledialog
        import tkinter.filedialog
    except ImportError:
        pass
    
    app = BlossomFocusApp()
    app.run()

