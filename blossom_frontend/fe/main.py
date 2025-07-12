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
        self.current_page = "dashboard"
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
        return {
            'level': 1,
            'xp': 0,
            'streak': 0,
            'tasks': [],
            'completed_tasks': 0,
            'focus_sessions': 0,
            'total_focus_time': 0,
            'garden_progress': 0,
            'pet_happiness': 100,
            'achievements': [],
            'theme': 'neon_garden'
        }
    
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
        
        # Show dashboard by default
        self.show_dashboard()
    
    def create_sidebar(self):
        """Create navigation sidebar"""
        sidebar = tk.Frame(self.main_frame, bg=self.colors['dark_gray'], width=250)
        sidebar.pack(side='left', fill='y', padx=(0, 20))
        sidebar.pack_propagate(False)
        
        # App title
        title_label = tk.Label(sidebar, text="🌸 BLOSSOM FOCUS", 
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
            ("🏠 Dashboard", "dashboard"),
            ("✅ Tasks", "tasks"),
            ("⏰ Focus Timer", "timer"),
            ("🌸 Garden", "garden"),
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
        if page == "dashboard":
            self.show_dashboard()
        elif page == "tasks":
            self.show_tasks()
        elif page == "timer":
            self.show_timer()
        elif page == "garden":
            self.show_garden()
        elif page == "analytics":
            self.show_analytics()
        elif page == "settings":
            self.show_settings()
    
    def show_dashboard(self):
        """Show main dashboard"""
        # Page title
        title = tk.Label(self.content_frame, text="✨ DASHBOARD", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['hot_pink'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        # Stats cards container
        stats_container = tk.Frame(self.content_frame, bg=self.colors['black'])
        stats_container.pack(fill='x', pady=(0, 30))
        
        # Create stat cards
        self.create_stat_card(stats_container, "Tasks Completed", 
                             str(self.user_data['completed_tasks']), 
                             self.colors['electric_blue'], 0, 0)
        
        self.create_stat_card(stats_container, "Focus Sessions", 
                             str(self.user_data['focus_sessions']), 
                             self.colors['neon_purple'], 0, 1)
        
        self.create_stat_card(stats_container, "Garden Progress", 
                             f"{self.user_data['garden_progress']}%", 
                             self.colors['hot_pink'], 0, 2)
        
        # Quick actions
        actions_frame = tk.Frame(self.content_frame, bg=self.colors['black'])
        actions_frame.pack(fill='x', pady=20)
        
        actions_title = tk.Label(actions_frame, text="Quick Actions", 
                                font=('Montserrat', 16, 'bold'),
                                fg=self.colors['white'], 
                                bg=self.colors['black'])
        actions_title.pack(pady=(0, 15))
        
        buttons_frame = tk.Frame(actions_frame, bg=self.colors['black'])
        buttons_frame.pack()
        
        # Quick action buttons
        ttk.Button(buttons_frame, text="🎯 Start Focus Session", 
                  style='Neon.TButton',
                  command=lambda: self.switch_page("timer")).pack(side='left', padx=10)
        
        ttk.Button(buttons_frame, text="➕ Add Task", 
                  style='Electric.TButton',
                  command=self.quick_add_task).pack(side='left', padx=10)
        
        ttk.Button(buttons_frame, text="🌸 Check Garden", 
                  style='Purple.TButton',
                  command=lambda: self.switch_page("garden")).pack(side='left', padx=10)
        
        # Recent tasks preview
        self.show_recent_tasks_preview()
    
    def create_stat_card(self, parent, title, value, color, row, col):
        """Create a stat card widget"""
        card = tk.Frame(parent, bg=self.colors['dark_gray'], relief='raised', bd=2)
        card.grid(row=row, column=col, padx=15, pady=10, sticky='ew')
        parent.grid_columnconfigure(col, weight=1)
        
        value_label = tk.Label(card, text=value, 
                              font=('Orbitron', 20, 'bold'),
                              fg=color, 
                              bg=self.colors['dark_gray'])
        value_label.pack(pady=(20, 5))
        
        title_label = tk.Label(card, text=title, 
                              font=('Montserrat', 10),
                              fg=self.colors['white'], 
                              bg=self.colors['dark_gray'])
        title_label.pack(pady=(0, 20))
    
    def show_recent_tasks_preview(self):
        """Show preview of recent tasks on dashboard"""
        preview_frame = tk.Frame(self.content_frame, bg=self.colors['black'])
        preview_frame.pack(fill='both', expand=True, pady=20)
        
        preview_title = tk.Label(preview_frame, text="Recent Tasks", 
                                font=('Montserrat', 16, 'bold'),
                                fg=self.colors['white'], 
                                bg=self.colors['black'])
        preview_title.pack(pady=(0, 15))
        
        # Task list frame
        tasks_frame = tk.Frame(preview_frame, bg=self.colors['dark_gray'])
        tasks_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        if not self.user_data['tasks']:
            no_tasks = tk.Label(tasks_frame, text="No tasks yet! Add some to get started 🚀", 
                               font=('Montserrat', 12),
                               fg=self.colors['electric_blue'], 
                               bg=self.colors['dark_gray'])
            no_tasks.pack(expand=True)
        else:
            for i, task in enumerate(self.user_data['tasks'][:5]):  # Show only first 5
                self.create_task_preview(tasks_frame, task, i)
    
    def create_task_preview(self, parent, task, index):
        """Create a task preview widget"""
        task_frame = tk.Frame(parent, bg=self.colors['light_gray'])
        task_frame.pack(fill='x', padx=10, pady=5)
        
        # Task text
        task_text = tk.Label(task_frame, text=task['title'], 
                            font=('Montserrat', 11),
                            fg=self.colors['white'], 
                            bg=self.colors['light_gray'])
        task_text.pack(side='left', padx=15, pady=10)
        
        # Priority indicator
        priority_colors = {
            'high': self.colors['hot_pink'],
            'medium': self.colors['neon_purple'],
            'low': self.colors['electric_blue']
        }
        priority_color = priority_colors.get(task.get('priority', 'low'), self.colors['electric_blue'])
        
        priority_label = tk.Label(task_frame, text=f"● {task.get('priority', 'low').upper()}", 
                                 font=('Montserrat', 9, 'bold'),
                                 fg=priority_color, 
                                 bg=self.colors['light_gray'])
        priority_label.pack(side='right', padx=15, pady=10)
    
    def show_tasks(self):
        """Show task management page"""
        # Page title
        title = tk.Label(self.content_frame, text="✅ TASK MANAGER", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['electric_blue'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        # Add task section
        add_frame = tk.Frame(self.content_frame, bg=self.colors['dark_gray'])
        add_frame.pack(fill='x', padx=20, pady=(0, 20))
        
        add_title = tk.Label(add_frame, text="Add New Task", 
                            font=('Montserrat', 14, 'bold'),
                            fg=self.colors['white'], 
                            bg=self.colors['dark_gray'])
        add_title.pack(pady=15)
        
        # Task input
        input_frame = tk.Frame(add_frame, bg=self.colors['dark_gray'])
        input_frame.pack(pady=10)
        
        self.task_entry = tk.Entry(input_frame, font=('Montserrat', 11), width=40,
                                  bg=self.colors['light_gray'], 
                                  fg=self.colors['white'],
                                  insertbackground=self.colors['white'])
        self.task_entry.pack(side='left', padx=10)
        
        # Priority selection
        self.priority_var = tk.StringVar(value="medium")
        priority_frame = tk.Frame(input_frame, bg=self.colors['dark_gray'])
        priority_frame.pack(side='left', padx=10)
        
        for priority in ['low', 'medium', 'high']:
            rb = tk.Radiobutton(priority_frame, text=priority.capitalize(), 
                               variable=self.priority_var, value=priority,
                               font=('Montserrat', 9),
                               fg=self.colors['white'], 
                               bg=self.colors['dark_gray'],
                               selectcolor=self.colors['light_gray'])
            rb.pack(side='left', padx=5)
        
        ttk.Button(input_frame, text="Add Task", 
                  style='Neon.TButton',
                  command=self.add_task).pack(side='left', padx=10)
        
        # Tasks list
        self.show_tasks_list()
    
    def show_tasks_list(self):
        """Display the list of tasks"""
        # Create scrollable frame for tasks
        tasks_container = tk.Frame(self.content_frame, bg=self.colors['black'])
        tasks_container.pack(fill='both', expand=True, padx=20)
        
        tasks_title = tk.Label(tasks_container, text="Your Tasks", 
                              font=('Montserrat', 16, 'bold'),
                              fg=self.colors['white'], 
                              bg=self.colors['black'])
        tasks_title.pack(pady=(0, 15))
        
        # Scrollable tasks frame
        canvas = tk.Canvas(tasks_container, bg=self.colors['dark_gray'])
        scrollbar = ttk.Scrollbar(tasks_container, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg=self.colors['dark_gray'])
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Display tasks
        if not self.user_data['tasks']:
            no_tasks = tk.Label(scrollable_frame, text="No tasks yet! Add your first task above 🎯", 
                               font=('Montserrat', 12),
                               fg=self.colors['electric_blue'], 
                               bg=self.colors['dark_gray'])
            no_tasks.pack(expand=True, pady=50)
        else:
            for i, task in enumerate(self.user_data['tasks']):
                self.create_task_widget(scrollable_frame, task, i)
    
    def create_task_widget(self, parent, task, index):
        """Create a task widget with complete/delete options"""
        task_frame = tk.Frame(parent, bg=self.colors['light_gray'], relief='raised', bd=1)
        task_frame.pack(fill='x', padx=10, pady=5)
        
        # Task content
        content_frame = tk.Frame(task_frame, bg=self.colors['light_gray'])
        content_frame.pack(fill='x', padx=15, pady=10)
        
        # Task title
        task_title = tk.Label(content_frame, text=task['title'], 
                             font=('Montserrat', 12, 'bold'),
                             fg=self.colors['white'], 
                             bg=self.colors['light_gray'])
        task_title.pack(side='left')
        
        # Buttons frame
        buttons_frame = tk.Frame(content_frame, bg=self.colors['light_gray'])
        buttons_frame.pack(side='right')
        
        # Complete button
        complete_btn = tk.Button(buttons_frame, text="✓", 
                                font=('Montserrat', 12, 'bold'),
                                fg=self.colors['white'],
                                bg=self.colors['electric_blue'],
                                command=lambda i=index: self.complete_task(i),
                                width=3)
        complete_btn.pack(side='left', padx=2)
        
        # Delete button
        delete_btn = tk.Button(buttons_frame, text="✗", 
                              font=('Montserrat', 12, 'bold'),
                              fg=self.colors['white'],
                              bg=self.colors['hot_pink'],
                              command=lambda i=index: self.delete_task(i),
                              width=3)
        delete_btn.pack(side='left', padx=2)
        
        # Priority and date
        info_frame = tk.Frame(task_frame, bg=self.colors['light_gray'])
        info_frame.pack(fill='x', padx=15, pady=(0, 10))
        
        priority_colors = {
            'high': self.colors['hot_pink'],
            'medium': self.colors['neon_purple'],
            'low': self.colors['electric_blue']
        }
        priority_color = priority_colors.get(task.get('priority', 'low'), self.colors['electric_blue'])
        
        priority_label = tk.Label(info_frame, text=f"Priority: {task.get('priority', 'low').upper()}", 
                                 font=('Montserrat', 9),
                                 fg=priority_color, 
                                 bg=self.colors['light_gray'])
        priority_label.pack(side='left')
        
        date_label = tk.Label(info_frame, text=f"Added: {task.get('created', 'Today')}", 
                             font=('Montserrat', 9),
                             fg=self.colors['white'], 
                             bg=self.colors['light_gray'])
        date_label.pack(side='right')
    
    def add_task(self):
        """Add a new task"""
        task_text = self.task_entry.get().strip()
        if not task_text:
            messagebox.showwarning("Warning", "Please enter a task!")
            return
        
        new_task = {
            'title': task_text,
            'priority': self.priority_var.get(),
            'created': datetime.now().strftime("%Y-%m-%d"),
            'completed': False
        }
        
        self.user_data['tasks'].append(new_task)
        self.task_entry.delete(0, tk.END)
        self.save_user_data()
        
        # Refresh tasks display
        self.switch_page("tasks")
        
        messagebox.showinfo("Success", "Task added! 🎯")
    
    def quick_add_task(self):
        """Quick add task from dashboard"""
        task_text = tk.simpledialog.askstring("Add Task", "Enter your task:")
        if task_text:
            new_task = {
                'title': task_text,
                'priority': 'medium',
                'created': datetime.now().strftime("%Y-%m-%d"),
                'completed': False
            }
            self.user_data['tasks'].append(new_task)
            self.save_user_data()
            messagebox.showinfo("Success", "Task added! 🎯")
    
    def complete_task(self, index):
        """Mark task as completed"""
        if index < len(self.user_data['tasks']):
            completed_task = self.user_data['tasks'].pop(index)
            self.user_data['completed_tasks'] += 1
            self.user_data['xp'] += 10
            self.user_data['garden_progress'] = min(100, self.user_data['garden_progress'] + 5)
            
            # Level up check
            if self.user_data['xp'] >= self.user_data['level'] * 100:
                self.user_data['level'] += 1
                messagebox.showinfo("Level Up!", f"🎉 Congratulations! You reached Level {self.user_data['level']}!")
            
            self.save_user_data()
            self.switch_page("tasks")
            messagebox.showinfo("Task Completed!", "Great job! +10 XP earned! 🌟")
    
    def delete_task(self, index):
        """Delete a task"""
        if index < len(self.user_data['tasks']):
            if messagebox.askyesno("Delete Task", "Are you sure you want to delete this task?"):
                self.user_data['tasks'].pop(index)
                self.save_user_data()
                self.switch_page("tasks")
    
    def show_timer(self):
        """Show focus timer page"""
        # Page title
        title = tk.Label(self.content_frame, text="⏰ FOCUS TIMER", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['neon_purple'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        # Timer display
        timer_frame = tk.Frame(self.content_frame, bg=self.colors['dark_gray'])
        timer_frame.pack(pady=30)
        
        self.timer_display = tk.Label(timer_frame, text="25:00", 
                                     font=('Orbitron', 48, 'bold'),
                                     fg=self.colors['electric_blue'], 
                                     bg=self.colors['dark_gray'])
        self.timer_display.pack(padx=50, pady=30)
        
        # Timer controls
        controls_frame = tk.Frame(self.content_frame, bg=self.colors['black'])
        controls_frame.pack(pady=20)
        
        self.start_btn = ttk.Button(controls_frame, text="🎯 Start Focus", 
                                   style='Neon.TButton',
                                   command=self.start_timer)
        self.start_btn.pack(side='left', padx=10)
        
        self.pause_btn = ttk.Button(controls_frame, text="⏸️ Pause", 
                                   style='Electric.TButton',
                                   command=self.pause_timer)
        self.pause_btn.pack(side='left', padx=10)
        
        self.reset_btn = ttk.Button(controls_frame, text="🔄 Reset", 
                                   style='Purple.TButton',
                                   command=self.reset_timer)
        self.reset_btn.pack(side='left', padx=10)
        
        # Session length selector
        length_frame = tk.Frame(self.content_frame, bg=self.colors['black'])
        length_frame.pack(pady=30)
        
        length_label = tk.Label(length_frame, text="Session Length:", 
                               font=('Montserrat', 12, 'bold'),
                               fg=self.colors['white'], 
                               bg=self.colors['black'])
        length_label.pack()
        
        lengths = [("25 min", 25), ("45 min", 45), ("60 min", 60)]
        for text, minutes in lengths:
            btn = tk.Button(length_frame, text=text, 
                           font=('Montserrat', 10),
                           fg=self.colors['white'],
                           bg=self.colors['light_gray'],
                           command=lambda m=minutes: self.set_timer_length(m))
            btn.pack(side='left', padx=5)
        
        # Initialize timer
        self.timer_seconds = self.focus_session_length
        self.update_timer_display()
    
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
        self.user_data['garden_progress'] = min(100, self.user_data['garden_progress'] + 10)
        self.user_data['pet_happiness'] = min(100, self.user_data['pet_happiness'] + 15)
        
        # Level up check
        if self.user_data['xp'] >= self.user_data['level'] * 100:
            self.user_data['level'] += 1
            messagebox.showinfo("Level Up!", f"🎉 Congratulations! You reached Level {self.user_data['level']}!")
        
        self.save_user_data()
        messagebox.showinfo("Focus Session Complete!", 
                           "🎉 Great focus session! +25 XP earned!\n🌸 Your garden is blooming!")
        
        # Reset timer
        self.timer_seconds = self.focus_session_length
        self.update_timer_display()
    
    def show_garden(self):
        """Show virtual garden page"""
        # Page title
        title = tk.Label(self.content_frame, text="🌸 DIGITAL GARDEN", 
                        font=('Orbitron', 24, 'bold'),
                        fg=self.colors['hot_pink'], 
                        bg=self.colors['black'])
        title.pack(pady=(0, 30))
        
        # Garden display
        garden_frame = tk.Frame(self.content_frame, bg=self.colors['dark_gray'], 
                               relief='raised', bd=2)
        garden_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Garden progress
        progress_frame = tk.Frame(garden_frame, bg=self.colors['dark_gray'])
        progress_frame.pack(fill='x', padx=20, pady=20)
        
        progress_label = tk.Label(progress_frame, text=f"Garden Progress: {self.user_data['garden_progress']}%", 
                                 font=('Montserrat', 14, 'bold'),
                                 fg=self.colors['electric_blue'], 
                                 bg=self.colors['dark_gray'])
        progress_label.pack()
        
        # Progress bar simulation
        progress_bar_frame = tk.Frame(progress_frame, bg=self.colors['light_gray'], height=20)
        progress_bar_frame.pack(fill='x', pady=10)
        
        progress_fill = tk.Frame(progress_bar_frame, bg=self.colors['neon_purple'], height=20)
        progress_fill.place(relwidth=self.user_data['garden_progress']/100, relheight=1)
        
        # Garden visualization
        garden_display = tk.Frame(garden_frame, bg=self.colors['black'], height=300)
        garden_display.pack(fill='x', padx=20, pady=20)
        
        # Simple garden representation
        garden_text = self.get_garden_display()
        garden_label = tk.Label(garden_display, text=garden_text, 
                               font=('Courier', 12),
                               fg=self.colors['electric_blue'], 
                               bg=self.colors['black'],
                               justify='center')
        garden_label.pack(expand=True)
        
        # Pet status
        pet_frame = tk.Frame(garden_frame, bg=self.colors['dark_gray'])
        pet_frame.pack(fill='x', padx=20, pady=20)
        
        pet_label = tk.Label(pet_frame, text=f"🤖 Digital Pet Happiness: {self.user_data['pet_happiness']}%", 
                            font=('Montserrat', 14, 'bold'),
                            fg=self.colors['hot_pink'], 
                            bg=self.colors['dark_gray'])
        pet_label.pack()
        
        # Pet mood
        if self.user_data['pet_happiness'] >= 80:
            mood = "😊 Very Happy!"
        elif self.user_data['pet_happiness'] >= 60:
            mood = "😌 Content"
        elif self.user_data['pet_happiness'] >= 40:
            mood = "😐 Neutral"
        else:
            mood = "😢 Needs attention"
        
        mood_label = tk.Label(pet_frame, text=f"Mood: {mood}", 
                             font=('Montserrat', 12),
                             fg=self.colors['white'], 
                             bg=self.colors['dark_gray'])
        mood_label.pack()
    
    def get_garden_display(self):
        """Generate ASCII art garden based on progress"""
        progress = self.user_data['garden_progress']
        
        if progress >= 80:
            return """
    🌸🌺🌸🌺🌸🌺🌸
    🌿🌱🌿🌱🌿🌱🌿
    🌸🌺🌸🌺🌸🌺🌸
    ═══════════════════
    Your garden is in full bloom! 🌟
            """
        elif progress >= 60:
            return """
    🌸🌺🌸  🌸🌺🌸
    🌿🌱🌿  🌿🌱🌿
    🌸  🌸  🌸  🌸
    ═══════════════════
    Beautiful flowers are growing! 🌱
            """
        elif progress >= 40:
            return """
    🌱  🌱  🌱  🌱
    🌿    🌿    🌿
    🌱  🌱  🌱  🌱
    ═══════════════════
    Your garden is sprouting! 🌿
            """
        elif progress >= 20:
            return """
    🌱    🌱    🌱
    
    🌱    🌱    🌱
    ═══════════════════
    First sprouts appearing! 🌱
            """
        else:
            return """
    ░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░░░░░░░░░░
    ═══════════════════
    Plant some seeds by completing tasks! 🌱
            """
    
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
                'garden_progress': 0,
                'pet_happiness': 100,
                'achievements': [],
                'theme': 'neon_garden'
            }
            self.save_user_data()
            messagebox.showinfo("Reset Complete", "All progress has been reset! 🔄")
            self.switch_page("dashboard")
    
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
