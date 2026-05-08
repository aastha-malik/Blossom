import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
import calendar
from datetime import datetime, timedelta
import threading
import time
import requests
import hashlib
import http.server
import socketserver
import socket
import webbrowser
from urllib.parse import urlparse, parse_qs, unquote


def get_edition_label():
    now = datetime.now()
    start = datetime(now.year, 1, 1)
    day_of_year = (now - start).days + 1
    week = (day_of_year - 1) // 7 + 1
    issue = ((week - 1) % 13) + 1
    m = now.month
    if m >= 3 and m <= 5:
        season = "spring"
    elif m >= 6 and m <= 8:
        season = "summer"
    elif m >= 9 and m <= 11:
        season = "autumn"
    else:
        season = "winter"
    yr = str(now.year)[2:]
    return f"no. {str(issue).zfill(2)}  ·  {season} '{yr}"


class TendrApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Tendr")
        self.root.geometry("1500x900")

        self.current_page = "today"
        self.user_data = self.load_user_data()
        self.timer_running = False
        self.timer_seconds = 0
        self.focus_session_length = 25 * 60

        self.is_logged_in = False
        self.current_username = None
        self.current_email = None
        self.auth_token = None
        self.backend_url = "https://tendrbackend.onrender.com"

        self.C = {
            'bg':       '#1a1410',
            'surface':  '#221a14',
            'surface2': '#2a2118',
            'ink':      '#f0e8d8',
            'ink_soft': '#c9bfae',
            'muted':    '#8a7e6a',
            'accent':   '#e07158',
            'accent2':  '#9bb87a',
            'accent3':  '#7ea0c4',
            'amber':    '#e0b25a',
            'rule':     '#2f2520',
            'hi':       '#3d2a22',
            # kept for backwards compat with old references
            'hot_pink':     '#e07158',
            'electric_blue':'#7ea0c4',
            'neon_purple':  '#9bb87a',
            'black':        '#1a1410',
            'white':        '#f0e8d8',
            'dark_gray':    '#221a14',
            'light_gray':   '#2a2118',
        }
        # alias so old code that reads self.colors still works
        self.colors = self.C

        self.FONT_SERIF  = ('Georgia', )
        self.FONT_MONO   = ('Courier', )
        self.FONT_SANS   = ('Helvetica', )

        self._oauth_raw_params = None   # set by local callback server
        self._oauth_server = None

        self.root.configure(bg=self.C['bg'])
        self._setup_styles()
        self._create_main_interface()

    # ─── styles ───────────────────────────────────────────────────────────────

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')

        style.configure('Primary.TButton',
                        background=self.C['accent'],
                        foreground=self.C['bg'],
                        borderwidth=0,
                        focuscolor='none',
                        font=(*self.FONT_SANS, 11, 'bold'))
        style.map('Primary.TButton',
                  background=[('active', '#c9604a')])

        style.configure('Ghost.TButton',
                        background=self.C['surface2'],
                        foreground=self.C['ink_soft'],
                        borderwidth=0,
                        focuscolor='none',
                        font=(*self.FONT_SANS, 10))
        style.map('Ghost.TButton',
                  background=[('active', self.C['surface'])])

        style.configure('Danger.TButton',
                        background=self.C['hi'],
                        foreground=self.C['accent'],
                        borderwidth=0,
                        focuscolor='none',
                        font=(*self.FONT_SANS, 10, 'bold'))

        # keep old names alive so nothing breaks
        style.configure('Neon.TButton',
                        background=self.C['accent'],
                        foreground=self.C['bg'],
                        borderwidth=0, focuscolor='none',
                        font=(*self.FONT_SANS, 10, 'bold'))
        style.map('Neon.TButton', background=[('active', '#c9604a')])

        style.configure('Electric.TButton',
                        background=self.C['accent3'],
                        foreground=self.C['bg'],
                        borderwidth=0, focuscolor='none',
                        font=(*self.FONT_SANS, 10, 'bold'))
        style.map('Electric.TButton', background=[('active', '#6b8fb3')])

        style.configure('Purple.TButton',
                        background=self.C['accent2'],
                        foreground=self.C['bg'],
                        borderwidth=0, focuscolor='none',
                        font=(*self.FONT_SANS, 10, 'bold'))
        style.map('Purple.TButton', background=[('active', '#86a668')])

        style.configure('TScrollbar',
                        background=self.C['surface2'],
                        troughcolor=self.C['surface'],
                        bordercolor=self.C['rule'],
                        arrowcolor=self.C['muted'])

        style.configure('TProgressbar',
                        background=self.C['accent2'],
                        troughcolor=self.C['surface2'],
                        bordercolor=self.C['rule'])

    # ─── data ─────────────────────────────────────────────────────────────────

    def load_user_data(self):
        try:
            if os.path.exists('fe/user_data.json'):
                with open('fe/user_data.json', 'r') as f:
                    return json.load(f)
        except:
            pass
        return {
            'pets': [], 'current_pet_id': 0, 'xp': 0, 'streak': 0,
            'tasks': [], 'completed_tasks': 0, 'focus_sessions': 0,
            'total_focus_time': 0, 'achievements': [], 'theme': 'tendr',
        }

    def save_user_data(self):
        try:
            os.makedirs('fe', exist_ok=True)
            with open('fe/user_data.json', 'w') as f:
                json.dump(self.user_data, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")

    def get_current_pet(self):
        if not self.is_logged_in or not self.auth_token:
            return None
        pets = self.fetch_pets_from_backend()
        if not pets:
            return None
        converted = []
        for p in pets:
            lf = p.get('last_fed')
            if isinstance(lf, str):
                lf = lf.split('T')[0]
            elif hasattr(lf, 'strftime'):
                lf = lf.strftime('%Y-%m-%d')
            else:
                lf = datetime.now().strftime('%Y-%m-%d')
            converted.append({
                'id': p.get('id'), 'name': p.get('name'),
                'type': p.get('type'), 'age': p.get('age', 0),
                'xp': 0, 'hunger': p.get('hunger', 100),
                'last_fed': lf, 'is_alive': p.get('is_alive', True),
            })
        return converted[0]

    def save_current_pet(self, pet):
        pets = self.user_data.get('pets', [])
        for i, p in enumerate(pets):
            if p['id'] == pet['id']:
                pets[i] = pet
                break
        self.user_data['pets'] = pets
        self.save_user_data()

    def update_pet_hunger(self, pet):
        last_fed = datetime.strptime(pet['last_fed'], '%Y-%m-%d')
        days_unfed = (datetime.now() - last_fed).days
        if days_unfed > 0:
            pet['hunger'] = max(0, pet['hunger'] - 15 * days_unfed)
            if days_unfed >= 7:
                pet['is_alive'] = False
        return pet

    # ─── layout ───────────────────────────────────────────────────────────────

    def _create_main_interface(self):
        self.main_frame = tk.Frame(self.root, bg=self.C['bg'])
        self.main_frame.pack(fill='both', expand=True)
        self._create_sidebar()
        self.content_frame = tk.Frame(self.main_frame, bg=self.C['bg'])
        self.content_frame.pack(side='right', fill='both', expand=True, padx=32, pady=28)
        self.show_today()

    def _create_sidebar(self):
        sidebar = tk.Frame(self.main_frame, bg=self.C['surface'], width=220)
        sidebar.pack(side='left', fill='y')
        sidebar.pack_propagate(False)

        # Brand
        brand_frame = tk.Frame(sidebar, bg=self.C['surface'])
        brand_frame.pack(fill='x', padx=22, pady=(28, 6))

        tk.Label(brand_frame, text="Tendr",
                 font=(*self.FONT_SERIF, 20, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w')

        tk.Label(brand_frame, text=get_edition_label(),
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', pady=(2, 0))

        # Rule
        tk.Frame(sidebar, bg=self.C['rule'], height=1).pack(fill='x', padx=22, pady=(14, 18))

        # Stats
        stats_frame = tk.Frame(sidebar, bg=self.C['surface'])
        stats_frame.pack(fill='x', padx=22, pady=(0, 18))

        tk.Label(stats_frame, text="XP",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w')

        if self.is_logged_in and self.auth_token:
            xp = self.fetch_user_xp_from_backend()
            self.user_data['xp'] = xp
        else:
            self.user_data['xp'] = 0

        self.xp_label = tk.Label(stats_frame,
                                  text=str(self.user_data['xp']),
                                  font=(*self.FONT_MONO, 14, 'bold'),
                                  fg=self.C['amber'], bg=self.C['surface'],
                                  anchor='w')
        self.xp_label.pack(anchor='w', pady=(1, 8))

        tk.Label(stats_frame, text="STREAK",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w')

        self.streak_label = tk.Label(stats_frame,
                                      text=f"{self.user_data['streak']} days",
                                      font=(*self.FONT_MONO, 12),
                                      fg=self.C['ink_soft'], bg=self.C['surface'],
                                      anchor='w')
        self.streak_label.pack(anchor='w', pady=(1, 0))

        # Rule
        tk.Frame(sidebar, bg=self.C['rule'], height=1).pack(fill='x', padx=22, pady=(4, 18))

        # Nav
        tk.Label(sidebar, text="NAVIGATE",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=22, pady=(0, 8))

        self._nav_buttons = {}
        nav_items = [
            ("Today",   "today"),
            ("Pet",     "pet"),
            ("Ledger",  "ledger"),
            ("Archive", "archive"),
        ]
        for label, page in nav_items:
            btn = tk.Button(sidebar, text=label,
                            font=(*self.FONT_SERIF, 13, 'italic'),
                            fg=self.C['ink_soft'],
                            bg=self.C['surface'],
                            activebackground=self.C['hi'],
                            activeforeground=self.C['accent'],
                            border=0, pady=10, anchor='w', padx=22,
                            cursor='hand2',
                            command=lambda p=page: self.switch_page(p))
            btn.pack(fill='x')
            self._nav_buttons[page] = btn

        self._update_nav_highlight(self.current_page)

    def _update_nav_highlight(self, active):
        for page, btn in self._nav_buttons.items():
            if page == active:
                btn.config(fg=self.C['accent'], bg=self.C['hi'])
            else:
                btn.config(fg=self.C['ink_soft'], bg=self.C['surface'])

    def update_sidebar_stats(self):
        if self.is_logged_in and self.auth_token:
            self.user_data['xp'] = self.fetch_user_xp_from_backend()
        else:
            self.user_data['xp'] = 0
        if hasattr(self, 'xp_label'):
            self.xp_label.config(text=str(self.user_data['xp']))
        if hasattr(self, 'streak_label'):
            self.streak_label.config(text=f"{self.user_data['streak']} days")

    def switch_page(self, page):
        self.current_page = page
        for w in self.content_frame.winfo_children():
            w.destroy()
        self._update_nav_highlight(page)
        dispatch = {
            'today':   self.show_today,
            'pet':     self.show_pet,
            'ledger':  self.show_analytics,
            'archive': self.show_settings,
            # keep old keys working
            'focus':    self.show_today,
            'analytics': self.show_analytics,
            'settings':  self.show_settings,
        }
        dispatch.get(page, self.show_today)()

    # ─── helpers ──────────────────────────────────────────────────────────────

    def _page_eyebrow(self, text):
        tk.Label(self.content_frame, text=text,
                 font=(*self.FONT_MONO, 9),
                 fg=self.C['muted'], bg=self.C['bg'],
                 anchor='w').pack(anchor='w', pady=(0, 4))

    def _page_title(self, text, color=None):
        tk.Label(self.content_frame, text=text,
                 font=(*self.FONT_SERIF, 26, 'italic'),
                 fg=color or self.C['ink'], bg=self.C['bg'],
                 anchor='w').pack(anchor='w', pady=(0, 6))

    def _rule(self, parent=None, padx=0, pady=12):
        p = parent or self.content_frame
        tk.Frame(p, bg=self.C['rule'], height=1).pack(fill='x', padx=padx, pady=pady)

    def _card(self, parent=None, padx=0, pady=8):
        p = parent or self.content_frame
        f = tk.Frame(p, bg=self.C['surface'], bd=0,
                     highlightthickness=1,
                     highlightbackground=self.C['rule'],
                     highlightcolor=self.C['rule'])
        f.pack(fill='x', padx=padx, pady=pady)
        return f

    def _section_label(self, parent, text):
        tk.Label(parent, text=text,
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=parent.cget('bg'),
                 anchor='w').pack(anchor='w', padx=16, pady=(14, 4))

    def _primary_btn(self, parent, text, cmd, padx=6, pady=0):
        return tk.Button(parent, text=text,
                         font=(*self.FONT_SANS, 10, 'bold'),
                         fg=self.C['bg'], bg=self.C['accent'],
                         activebackground='#c9604a',
                         activeforeground=self.C['bg'],
                         border=0, padx=14, pady=7,
                         cursor='hand2', command=cmd)

    def _ghost_btn(self, parent, text, cmd):
        return tk.Button(parent, text=text,
                         font=(*self.FONT_SANS, 10),
                         fg=self.C['ink_soft'], bg=self.C['surface2'],
                         activebackground=self.C['surface'],
                         activeforeground=self.C['ink'],
                         border=0, padx=12, pady=6,
                         cursor='hand2', command=cmd)

    def _input(self, parent, width=30, show=None):
        kwargs = dict(font=(*self.FONT_SANS, 11),
                      bg=self.C['surface2'], fg=self.C['ink'],
                      insertbackground=self.C['ink'],
                      relief='flat', bd=0,
                      highlightthickness=1,
                      highlightbackground=self.C['rule'],
                      highlightcolor=self.C['accent'],
                      width=width)
        if show:
            kwargs['show'] = show
        return tk.Entry(parent, **kwargs)

    # ─── Today (Task & Focus) ─────────────────────────────────────────────────

    def show_today(self):
        now = datetime.now()
        days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
        eyebrow = f"{days[now.weekday()]}  ·  {now.day} {months[now.month-1]}"
        self._page_eyebrow(eyebrow)
        self._page_title("Today")
        self._rule(pady=(4, 16))

        body = tk.Frame(self.content_frame, bg=self.C['bg'])
        body.pack(fill='both', expand=True)

        # Left — timer
        left = tk.Frame(body, bg=self.C['surface'],
                        highlightthickness=1,
                        highlightbackground=self.C['rule'],
                        highlightcolor=self.C['rule'],
                        width=380)
        left.pack(side='left', fill='y', padx=(0, 16), pady=0)
        left.pack_propagate(False)

        self._section_label(left, "FOCUS TIMER")

        self.timer_display = tk.Label(left,
                                      text="25:00",
                                      font=(*self.FONT_SERIF, 52, 'bold'),
                                      fg=self.C['ink'], bg=self.C['surface'])
        self.timer_display.pack(pady=(8, 4))

        timer_sub = tk.Label(left, text="focus session",
                             font=(*self.FONT_MONO, 9),
                             fg=self.C['muted'], bg=self.C['surface'])
        timer_sub.pack()

        tk.Frame(left, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=16)

        controls = tk.Frame(left, bg=self.C['surface'])
        controls.pack(padx=16, pady=(0, 12))

        self.start_btn = self._primary_btn(controls, "Start", self.start_timer)
        self.start_btn.pack(side='left', padx=(0, 6))
        self._ghost_btn(controls, "Pause", self.pause_timer).pack(side='left', padx=6)
        self._ghost_btn(controls, "Reset", self.reset_timer).pack(side='left', padx=6)

        tk.Frame(left, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(4, 12))
        self._section_label(left, "SESSION LENGTH")

        length_row = tk.Frame(left, bg=self.C['surface'])
        length_row.pack(padx=16, pady=(0, 20))
        for label, mins in [("25 min", 25), ("45 min", 45), ("60 min", 60)]:
            btn = tk.Button(length_row, text=label,
                            font=(*self.FONT_MONO, 9),
                            fg=self.C['muted'], bg=self.C['surface2'],
                            activebackground=self.C['hi'],
                            activeforeground=self.C['accent'],
                            border=0, padx=10, pady=5,
                            cursor='hand2',
                            command=lambda m=mins: self.set_timer_length(m))
            btn.pack(side='left', padx=4)

        # Right — tasks
        right = tk.Frame(body, bg=self.C['bg'])
        right.pack(side='left', fill='both', expand=True)

        self._section_label(right, "ADD TASK")

        add_card = tk.Frame(right, bg=self.C['surface'],
                            highlightthickness=1,
                            highlightbackground=self.C['rule'],
                            highlightcolor=self.C['rule'])
        add_card.pack(fill='x', pady=(4, 16))

        input_row = tk.Frame(add_card, bg=self.C['surface'])
        input_row.pack(fill='x', padx=16, pady=(12, 6))

        self.task_entry = self._input(input_row, width=38)
        self.task_entry.pack(side='left', padx=(0, 12), ipady=4)

        self.priority_var = tk.StringVar(value="medium")
        prio_frame = tk.Frame(input_row, bg=self.C['surface'])
        prio_frame.pack(side='left', padx=(0, 12))
        tk.Label(prio_frame, text="PRIORITY", font=(*self.FONT_MONO, 7),
                 fg=self.C['muted'], bg=self.C['surface']).pack(anchor='w')
        prio_btns = tk.Frame(prio_frame, bg=self.C['surface'])
        prio_btns.pack()
        for p in ['low', 'medium', 'high']:
            rb = tk.Radiobutton(prio_btns, text=p,
                                variable=self.priority_var, value=p,
                                font=(*self.FONT_MONO, 8),
                                fg=self.C['muted'], bg=self.C['surface'],
                                selectcolor=self.C['surface'],
                                activebackground=self.C['surface'],
                                activeforeground=self.C['accent'])
            rb.pack(side='left', padx=3)

        self._primary_btn(input_row, "Add", self.add_task).pack(side='left')

        # Category chips row
        cat_row = tk.Frame(add_card, bg=self.C['surface'])
        cat_row.pack(fill='x', padx=16, pady=(0, 12))
        tk.Label(cat_row, text="CATEGORY",
                 font=(*self.FONT_MONO, 7),
                 fg=self.C['muted'], bg=self.C['surface']).pack(side='left', padx=(0, 8))

        self.category_var = tk.StringVar(value="")
        CATEGORIES = ['Work', 'Personal', 'Home', 'Friends', 'Health']
        self._cat_btns = {}
        for cat in CATEGORIES:
            btn = tk.Button(cat_row, text=cat,
                            font=(*self.FONT_MONO, 8),
                            fg=self.C['muted'], bg=self.C['surface2'],
                            activeforeground=self.C['accent'],
                            activebackground=self.C['hi'],
                            border=0, padx=9, pady=3, cursor='hand2',
                            command=lambda c=cat: self._select_category(c))
            btn.pack(side='left', padx=3)
            self._cat_btns[cat] = btn

        # Task list
        self._section_label(right, "TASKS")

        list_wrap = tk.Frame(right, bg=self.C['bg'])
        list_wrap.pack(fill='both', expand=True)

        canvas = tk.Canvas(list_wrap, bg=self.C['bg'], bd=0,
                           highlightthickness=0)
        scrollbar = ttk.Scrollbar(list_wrap, orient="vertical",
                                   command=canvas.yview)
        scroll_frame = tk.Frame(canvas, bg=self.C['bg'])
        scroll_frame.bind("<Configure>",
                          lambda e: canvas.configure(
                              scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        tasks = []
        if self.is_logged_in and self.auth_token:
            for bt in self.fetch_tasks_from_backend():
                tasks.append({
                    'id':       bt.get('id'),
                    'text':     bt.get('title', ''),
                    'priority': bt.get('priority', 'medium'),
                    'category': bt.get('category') or '',
                    'completed': bt.get('completed', False),
                })

        if not tasks:
            tk.Label(scroll_frame,
                     text="No tasks yet — add one above.",
                     font=(*self.FONT_MONO, 10),
                     fg=self.C['muted'], bg=self.C['bg']).pack(pady=40)
        else:
            for i, task in enumerate(sorted(tasks, key=lambda t: t.get('completed', False))):
                self.create_task_widget(scroll_frame, task, i)

    def _select_category(self, cat):
        if self.category_var.get() == cat:
            self.category_var.set("")
            self._cat_btns[cat].config(fg=self.C['muted'], bg=self.C['surface2'])
        else:
            if self.category_var.get() and self.category_var.get() in self._cat_btns:
                self._cat_btns[self.category_var.get()].config(
                    fg=self.C['muted'], bg=self.C['surface2'])
            self.category_var.set(cat)
            self._cat_btns[cat].config(fg=self.C['accent'], bg=self.C['hi'])

    # ─── timer logic ──────────────────────────────────────────────────────────

    def set_timer_length(self, minutes):
        self.focus_session_length = minutes * 60
        if not self.timer_running:
            self.timer_seconds = self.focus_session_length
            self.update_timer_display()

    def start_timer(self):
        if not self.is_logged_in or not self.auth_token:
            self.show_login_required_popup("use the focus timer")
            return
        if not self.timer_running:
            self.timer_running = True
            t = threading.Thread(target=self.run_timer)
            t.daemon = True
            t.start()

    def pause_timer(self):
        self.timer_running = False

    def reset_timer(self):
        self.timer_running = False
        self.timer_seconds = self.focus_session_length
        self.update_timer_display()

    def run_timer(self):
        while self.timer_running and self.timer_seconds > 0:
            time.sleep(1)
            if self.timer_running:
                self.timer_seconds -= 1
                self.root.after(0, self.update_timer_display)
        if self.timer_seconds <= 0:
            self.root.after(0, self.timer_finished)

    def update_timer_display(self):
        m = self.timer_seconds // 60
        s = self.timer_seconds % 60
        if hasattr(self, 'timer_display'):
            self.timer_display.config(text=f"{m:02d}:{s:02d}")

    def timer_finished(self):
        self.timer_running = False
        if self.is_logged_in and self.auth_token:
            self.user_data['focus_sessions'] += 1
            self.user_data['total_focus_time'] += self.focus_session_length // 60
            self.save_user_data()
            self.update_sidebar_stats()
            messagebox.showinfo("Session complete",
                                "Focus session done. +25 XP earned.")
        else:
            messagebox.showwarning("Not logged in",
                                   "Log in to track your sessions.")
        self.timer_seconds = self.focus_session_length
        self.update_timer_display()

    # ─── tasks ────────────────────────────────────────────────────────────────

    def add_task(self):
        if not self.is_logged_in or not self.auth_token:
            self.show_login_required_popup("add tasks")
            return
        text = self.task_entry.get().strip()
        if not text:
            messagebox.showwarning("Empty task", "Enter a task description.")
            return
        category = self.category_var.get() if hasattr(self, 'category_var') else ''
        task_data = self.add_task_to_backend(text, self.priority_var.get(), category or None)
        if task_data:
            self.task_entry.delete(0, tk.END)
            if hasattr(self, 'category_var'):
                self.category_var.set('')
            self.switch_page('today')
        else:
            messagebox.showerror("Error", "Failed to add task.")

    def create_task_widget(self, parent, task, index):
        prio_colors = {
            'low':    self.C['accent3'],
            'medium': self.C['amber'],
            'high':   self.C['accent'],
        }
        prio_color = prio_colors.get(task['priority'], self.C['muted'])

        row = tk.Frame(parent, bg=self.C['surface'],
                       highlightthickness=1,
                       highlightbackground=self.C['rule'],
                       highlightcolor=self.C['rule'])
        row.pack(fill='x', pady=4)

        var = tk.BooleanVar(value=task['completed'])
        cb = tk.Checkbutton(row, variable=var,
                            bg=self.C['surface'],
                            activebackground=self.C['surface'],
                            selectcolor=self.C['surface2'],
                            command=lambda tid=task['id']: self.complete_task(tid))
        cb.pack(side='left', padx=10, pady=10)

        txt_color = self.C['muted'] if task['completed'] else self.C['ink']
        txt_font = (*self.FONT_SANS, 11, 'overstrike') if task['completed'] else (*self.FONT_SANS, 11)
        tk.Label(row, text=task['text'],
                 font=txt_font, fg=txt_color, bg=self.C['surface'],
                 anchor='w').pack(side='left', fill='x', expand=True, padx=6, pady=10)

        cat = task.get('category', '')
        if cat:
            tk.Label(row, text=cat,
                     font=(*self.FONT_MONO, 8),
                     fg=self.C['accent2'], bg=self.C['surface'],
                     padx=6, pady=3).pack(side='left', padx=2)

        tk.Label(row, text=task['priority'].upper(),
                 font=(*self.FONT_MONO, 8, 'bold'),
                 fg=prio_color, bg=self.C['surface'],
                 padx=6, pady=3).pack(side='left', padx=2)

        tk.Button(row, text="×",
                  font=(*self.FONT_SANS, 14),
                  fg=self.C['muted'], bg=self.C['surface'],
                  activeforeground=self.C['accent'],
                  activebackground=self.C['surface'],
                  border=0, cursor='hand2',
                  command=lambda tid=task['id']: self.delete_task(tid)
                  ).pack(side='left', padx=10)

    def complete_task(self, task_id):
        if self.is_logged_in and self.auth_token:
            tasks = self.fetch_tasks_from_backend()
            task = next((t for t in tasks if t.get('id') == task_id), None)
            if not task:
                messagebox.showerror("Error", "Task not found.")
                return
            new_completed = not task.get('completed', False)
            task_data = self.update_task_completed_backend(task_id, new_completed)
            if task_data:
                xp = task_data.get('userXP')
                if xp is not None:
                    self.user_data['xp'] = xp
                if new_completed:
                    xp_gained = task_data.get('xpReward', 0)
                    self.user_data['completed_tasks'] += 1
                    messagebox.showinfo("Done", f"+{xp_gained} XP")
                self.save_user_data()
                self.update_sidebar_stats()
                self.switch_page('today')
            else:
                messagebox.showerror("Error", "Failed to update task.")
        else:
            task = next((t for t in self.user_data['tasks'] if t['id'] == task_id), None)
            if not task:
                return
            was = task['completed']
            task['completed'] = not was
            if task['completed'] and not was:
                xp = {'low': 10, 'medium': 15, 'high': 25}.get(task['priority'], 10)
                self.user_data['xp'] += xp
                self.user_data['completed_tasks'] += 1
                messagebox.showinfo("Done", f"+{xp} XP")
            self.save_user_data()
            self.update_sidebar_stats()
            self.switch_page('today')

    def delete_task(self, task_id):
        if self.is_logged_in and self.auth_token:
            if self.delete_task_from_backend(task_id):
                self.switch_page('today')
            else:
                messagebox.showerror("Error", "Failed to delete task.")
        else:
            self.user_data['tasks'] = [t for t in self.user_data['tasks']
                                       if t['id'] != task_id]
            self.save_user_data()
            self.switch_page('today')

    # ─── Pet page ─────────────────────────────────────────────────────────────

    def _pet_stage(self, age):
        if age < 8:  return 'baby'
        if age < 22: return 'kid'
        if age < 41: return 'teen'
        return 'adult'

    def _pet_mood(self, belly, bond):
        if belly >= 80 and bond >= 75: return 'happy'
        if belly >= 70 and bond < 35:  return 'sleepy'
        if belly < 30 and bond < 30:   return 'sad'
        return 'content'

    def _draw_pet_sprite(self, canvas, species, stage, mood, s=1.5):
        """Draw pet sprite on a canvas. SVG coordinate space is 0-100."""
        C = self.C
        ink = C['ink']
        acc = C['accent']
        amb = C['amber']
        sag = C['accent2']
        BLUSH = '#f4b6b0'

        def ov(cx, cy, rx, ry, fill, ol='', lw=1):
            canvas.create_oval((cx-rx)*s, (cy-ry)*s, (cx+rx)*s, (cy+ry)*s,
                               fill=fill, outline=ol, width=lw)

        def ci(cx, cy, r, fill, ol='', lw=1):
            ov(cx, cy, r, r, fill, ol, lw)

        def pg(pts, fill, ol='', lw=1, smooth=False):
            sp = [v*s for v in pts]
            canvas.create_polygon(sp, fill=fill, outline=ol, width=lw, smooth=smooth)

        def ln(x1, y1, x2, y2, fill, lw=1):
            canvas.create_line(x1*s, y1*s, x2*s, y2*s, fill=fill, width=lw,
                               capstyle='round')

        def qb(x0, y0, cpx, cpy, x1, y1, fill, lw=1, filled=False):
            raw = []
            for i in range(13):
                t = i/12; mt = 1-t
                raw.extend([mt*mt*x0+2*mt*t*cpx+t*t*x1,
                             mt*mt*y0+2*mt*t*cpy+t*t*y1])
            sp = [v*s for v in raw]
            if filled:
                canvas.create_polygon(sp, fill=fill, outline='', smooth=False)
            else:
                canvas.create_line(sp, fill=fill, width=lw, capstyle='round',
                                   joinstyle='round')

        def txt(x, y, text, size, fill):
            canvas.create_text(x*s, y*s, text=text, fill=fill,
                               font=(*self.FONT_SERIF, max(6, int(size*s/1.5))))

        def eyes(lEx, lEy, rEx, rEy, color=None):
            col = color or ink
            if mood == 'happy':
                ci(lEx, lEy, 2.4, col); ci(rEx, rEy, 2.4, col)
                ci(lEx+0.7, lEy-0.7, 0.7, '#ffffff'); ci(rEx+0.7, rEy-0.7, 0.7, '#ffffff')
            elif mood == 'content':
                qb(lEx-3, lEy, lEx, lEy-3, lEx+3, lEy, col, 2)
                qb(rEx-3, rEy, rEx, rEy-3, rEx+3, rEy, col, 2)
            elif mood == 'sad':
                ci(lEx, lEy, 2.2, col); ci(rEx, rEy, 2.2, col)
                qb(rEx+1, rEy+2, rEx+2.5, rEy+5, rEx+1.5, rEy+7, C['accent3'], 2)
            else:  # sleepy
                qb(lEx-3, lEy+1, lEx, lEy+3, lEx+3, lEy+1, col, 2)
                qb(rEx-3, rEy+1, rEx, rEy+3, rEx+3, rEy+1, col, 2)

        def mth(mx, my, w=6, color=None):
            col = color or ink
            if mood == 'happy':
                qb(mx-w, my, mx, my+w, mx+w, my, acc, 2)
            elif mood == 'content':
                qb(mx-w/2, my, mx, my+2, mx+w/2, my, col, 2)
            elif mood == 'sad':
                qb(mx-w/2, my+2, mx, my-1, mx+w/2, my+2, col, 2)
            else:  # sleepy
                ov(mx, my+1, 1.5, 2, col)

        def aura(cx, cy, r):
            if mood == 'happy':
                ci(cx+r*0.7, cy-r*0.9, 4, acc); ci(cx-r*0.85, cy-r*0.7, 2.5, acc)
            elif mood == 'sleepy':
                txt(cx+r*0.7,  cy-r*0.55,  'z', 9,  C['ink_soft'])
                txt(cx+r*0.85, cy-r*0.85,  'z', 12, C['ink_soft'])
                txt(cx+r*1.05, cy-r*1.15,  'Z', 15, C['ink_soft'])
            elif mood == 'content':
                txt(cx+r*0.85, cy-r*0.75, '✦', 11, amb)

        # ── DOG BABY ──────────────────────────────────────────────────────────
        if species == 'dog' and stage == 'baby':
            fur = '#d9a26a'; furD = '#a87642'
            ov(50, 68, 22, 14, fur, ink, 2)
            ov(50, 70, 14, 8,  '#f0d4a6')
            ov(38, 80, 4,  3,  fur, ink, 1)
            ov(62, 80, 4,  3,  fur, ink, 1)
            ci(50, 44, 22, fur, ink, 2)
            pg([30,38, 24,50, 30,60, 34,56, 36,50], furD, ink, 1)
            pg([70,38, 76,50, 70,60, 66,56, 64,50], furD, ink, 1)
            ov(50, 50, 7, 5, '#f0d4a6', ink, 1)
            ov(50, 48, 2, 1.4, ink)
            ci(36, 48, 3, BLUSH); ci(64, 48, 3, BLUSH)
            eyes(42, 42, 58, 42)
            mth(50, 54, 4)
            aura(50, 50, 26)

        # ── DOG KID ───────────────────────────────────────────────────────────
        elif species == 'dog' and stage == 'kid':
            fur = '#c98e54'; furD = '#8e5e30'
            ov(32, 82, 8, 6, fur, ink, 1); ov(68, 82, 8, 6, fur, ink, 1)
            # body as closed bezier path approx
            pg([30,76, 26,56, 38,50, 50,46, 62,50, 74,56, 70,76], fur, ink, 2, smooth=True)
            ov(50, 66, 14, 10, '#e8c188')
            ov(45, 77, 3, 7, fur, ink, 1); ov(55, 77, 3, 7, fur, ink, 1)
            ci(50, 38, 20, fur, ink, 2)
            pg([32,30, 26,44, 32,52, 40,44], furD, ink, 1)
            pg([68,30, 74,44, 68,52, 60,44], furD, ink, 1)
            ov(50, 44, 7, 5, '#e8c188', ink, 1)
            ov(50, 42, 2, 1.4, ink)
            ln(50, 44, 50, 48, ink)
            ci(36, 42, 2.5, BLUSH); ci(64, 42, 2.5, BLUSH)
            eyes(42, 36, 58, 36)
            mth(50, 50, 5)
            aura(50, 38, 24)

        # ── DOG TEEN ──────────────────────────────────────────────────────────
        elif species == 'dog' and stage == 'teen':
            fur = '#e0b878'; furD = '#b8894a'; furL = '#f0d4a0'
            ov(37.5, 72, 3.5, 10, fur, ink, 1); ov(62.5, 72, 3.5, 10, fur, ink, 1)
            ov(37.5, 91, 5, 2.5, furD, ink, 1); ov(62.5, 91, 5, 2.5, furD, ink, 1)
            pg([28,76, 22,56, 36,50, 50,46, 64,50, 78,56, 72,76, 66,82, 50,82, 34,82], fur, ink, 2, smooth=True)
            pg([40,60, 44,72, 50,78, 56,72, 60,60, 55,64, 50,64, 45,64], furL)
            if mood in ('happy', 'content'):
                qb(72, 60, 86, 50, 84, 36, fur, 6)
                qb(72, 60, 86, 50, 84, 36, ink, 2)
            else:
                qb(72, 64, 86, 70, 82, 80, fur, 6)
                qb(72, 64, 86, 70, 82, 80, ink, 2)
            ov(50, 34, 19, 18, fur, ink, 2)
            pg([32,26, 22,32, 24,46, 28,52, 34,50, 34,38, 36,30], furD, ink, 1)
            pg([68,26, 78,32, 76,46, 72,52, 66,50, 66,38, 64,30], furD, ink, 1)
            ov(50, 42, 9, 6, furL, ink, 1)
            ov(50, 40, 2.5, 1.6, ink)
            ln(50, 42, 50, 46, ink)
            ci(38, 38, 2.5, BLUSH); ci(62, 38, 2.5, BLUSH)
            eyes(42, 32, 58, 32)
            mth(50, 48, 4)
            aura(50, 34, 22)

        # ── DOG ADULT ─────────────────────────────────────────────────────────
        elif species == 'dog' and stage == 'adult':
            fur = '#9a663a'; furD = '#5e3d20'
            pg([22,88, 14,70, 24,58, 38,64, 34,88], fur, ink, 2)
            pg([78,88, 86,70, 76,58, 62,64, 66,88], fur, ink, 2)
            pg([28,70, 22,48, 40,40, 60,40, 78,48, 72,70, 66,80, 50,80, 34,80], fur, ink, 2, smooth=True)
            ov(50, 62, 18, 10, '#c08a55')
            ov(43.5, 79, 3.5, 11, fur, ink, 1); ov(56.5, 79, 3.5, 11, fur, ink, 1)
            if mood in ('happy', 'content'):
                qb(74, 56, 90, 40, 86, 24, fur, 6)
                qb(74, 56, 90, 40, 86, 24, ink, 2)
            else:
                qb(74, 60, 90, 70, 86, 84, fur, 6)
                qb(74, 60, 90, 70, 86, 84, ink, 2)
            ci(50, 30, 20, fur, ink, 2)
            pg([30,22, 22,38, 30,50, 36,44, 38,36], furD, ink, 1)
            pg([70,22, 78,38, 70,50, 64,44, 62,36], furD, ink, 1)
            ov(50, 38, 9, 6, '#c08a55', ink, 1)
            ov(50, 35, 2.5, 1.6, ink)
            ln(50, 38, 50, 44, ink)
            qb(34, 50, 50, 56, 66, 50, acc, 3)
            ci(50, 54, 2, amb, ink, 1)
            ci(36, 34, 2.5, BLUSH); ci(64, 34, 2.5, BLUSH)
            eyes(42, 28, 58, 28)
            mth(50, 44, 5)
            aura(50, 30, 24)

        # ── CAT BABY ──────────────────────────────────────────────────────────
        elif species == 'cat' and stage == 'baby':
            fur = '#e8d5b8'; stripe = '#a87642'
            ov(50, 68, 24, 14, fur, ink, 2)
            ov(50, 70, 16, 8,  '#f7eadb')
            qb(40,58, 42,64, 38,70, stripe, 1)
            qb(52,58, 54,64, 50,70, stripe, 1)
            qb(64,58, 66,64, 62,70, stripe, 1)
            qb(28, 72, 22, 60, 30, 54, fur, 8); qb(28, 72, 22, 60, 30, 54, ink, 2)
            pg([34,28, 40,14, 46,26], fur, ink, 1)
            pg([66,28, 60,14, 54,26], fur, ink, 1)
            ci(50, 42, 22, fur, ink, 2)
            pg([37,26, 40,18, 43,26], BLUSH)
            pg([63,26, 60,18, 57,26], BLUSH)
            pg([48,48, 52,48, 50,50], acc)
            ln(38,50, 28,48, ink); ln(38,52, 28,53, ink)
            ln(62,50, 72,48, ink); ln(62,52, 72,53, ink)
            ci(36, 46, 3, BLUSH); ci(64, 46, 3, BLUSH)
            eyes(42, 42, 58, 42)
            mth(50, 54, 4)
            aura(50, 42, 26)

        # ── CAT KID ───────────────────────────────────────────────────────────
        elif species == 'cat' and stage == 'kid':
            fur = '#dcb37d'; stripe = '#8e5e30'
            pg([32,88, 26,60, 38,48, 50,44, 62,48, 74,60, 68,88], fur, ink, 2, smooth=True)
            ov(50, 70, 14, 14, '#f0d4a6')
            qb(36,56, 34,62, 38,68, stripe, 2); qb(64,56, 66,62, 62,68, stripe, 2)
            qb(68, 84, 86, 80, 82, 64, fur, 8); qb(68, 84, 86, 80, 82, 64, ink, 2)
            ov(40, 84, 5, 4, fur, ink, 1); ov(58, 84, 5, 4, fur, ink, 1)
            pg([34,22, 40,6, 46,20], fur, ink, 1)
            pg([66,22, 60,6, 54,20], fur, ink, 1)
            ci(50, 34, 20, fur, ink, 2)
            pg([37,20, 40,10, 43,20], BLUSH)
            pg([63,20, 60,10, 57,20], BLUSH)
            pg([48,40, 52,40, 50,42], acc)
            ln(38,42, 26,40, ink); ln(38,44, 26,46, ink)
            ln(62,42, 74,40, ink); ln(62,44, 74,46, ink)
            ci(36, 38, 2.5, BLUSH); ci(64, 38, 2.5, BLUSH)
            eyes(42, 34, 58, 34)
            mth(50, 46, 5)
            aura(50, 34, 22)

        # ── CAT TEEN (viewBox 0 -8 100 108 → shift y+8) ──────────────────────
        elif species == 'cat' and stage == 'teen':
            # All y coords shifted +8 from SVG source
            fur = '#c9924d'; furL = '#e8c188'; stripe = '#7c5128'
            ov(32, 88, 10, 12, fur, ink, 2); ov(68, 88, 10, 12, fur, ink, 2)
            pg([28,90, 20,66, 36,56, 50,52, 64,56, 80,66, 72,90, 66,96, 50,96, 34,96], fur, ink, 2, smooth=True)
            pg([34,64, 40,78, 50,82, 60,78, 66,64, 60,68, 54,68, 50,70, 46,68, 40,68], furL)
            qb(40,70, 38,78, 42,84, stripe, 2); qb(60,70, 62,78, 58,84, stripe, 2)
            ov(40, 94, 5, 3, fur, ink, 1); ov(60, 94, 5, 3, fur, ink, 1)
            if mood == 'sad':
                qb(72,78, 88,86, 86,98, fur, 10); qb(72,78, 88,86, 86,98, ink, 2)
            else:
                qb(72,64, 90,46, 84,26, fur, 10); qb(72,64, 90,46, 84,26, ink, 2)
            pg([30,30, 36,10, 46,28], fur, ink, 1)
            pg([70,30, 64,10, 54,28], fur, ink, 1)
            ov(50, 40, 18, 17, fur, ink, 2)
            pg([34,28, 36,16, 42,26], BLUSH)
            pg([66,28, 64,16, 58,26], BLUSH)
            pg([47,46, 53,46, 50,49], acc)
            ln(50, 49, 50, 52, ink)
            ln(38,48, 22,46, ink); ln(38,50, 22,52, ink)
            ln(62,48, 78,46, ink); ln(62,50, 78,52, ink)
            ci(38, 46, 2.5, BLUSH); ci(62, 46, 2.5, BLUSH)
            eyes(42, 38, 58, 38)
            mth(50, 54, 4)
            aura(50, 40, 24)

        # ── CAT ADULT (viewBox 0 -8 100 108 → shift y+8) ─────────────────────
        elif species == 'cat' and stage == 'adult':
            fur = '#a87236'; stripe = '#5e3d20'
            ov(32, 86, 12, 14, fur, ink, 2); ov(68, 86, 12, 14, fur, ink, 2)
            pg([30,88, 22,58, 38,46, 62,46, 78,58, 70,88, 66,96, 50,96, 34,96], fur, ink, 2, smooth=True)
            ov(50, 70, 16, 14, '#bd8c50')
            qb(34,60, 32,70, 36,80, stripe, 2)
            qb(50,58, 48,70, 52,84, stripe, 2)
            qb(66,60, 68,70, 64,80, stripe, 2)
            ov(40, 94, 6, 4, fur, ink, 1); ov(60, 94, 6, 4, fur, ink, 1)
            qb(44,96, 26,92, 28,78, fur, 7); qb(44,96, 26,92, 28,78, ink, 2)
            pg([32,26, 40,8, 48,24], fur, ink, 1)
            pg([68,26, 60,8, 52,24], fur, ink, 1)
            ci(50, 38, 20, fur, ink, 2)
            pg([37,24, 40,14, 43,24], BLUSH)
            pg([63,24, 60,14, 57,24], BLUSH)
            pg([47,44, 53,44, 50,47], acc)
            ln(50, 47, 50, 50, ink)
            ln(38,46, 22,44, ink); ln(38,48, 22,50, ink)
            ln(62,46, 78,44, ink); ln(62,48, 78,50, ink)
            qb(34, 58, 50, 64, 66, 58, acc, 3)
            ci(50, 62, 2, sag, ink, 1)
            ci(36, 44, 2.5, BLUSH); ci(64, 44, 2.5, BLUSH)
            eyes(42, 38, 58, 38)
            mth(50, 52, 4)
            aura(50, 38, 24)

    def _pet_stat_bar(self, parent, label, pct, color):
        """Compact labeled progress bar for pet stats."""
        row = tk.Frame(parent, bg=self.C['bg'])
        row.pack(fill='x', pady=(0, 8))
        hdr = tk.Frame(row, bg=self.C['bg'])
        hdr.pack(fill='x')
        tk.Label(hdr, text=label, font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['bg']).pack(side='left')
        tk.Label(hdr, text=f"{int(pct)}%", font=(*self.FONT_MONO, 8),
                 fg=self.C['ink_soft'], bg=self.C['bg']).pack(side='right')
        track = tk.Frame(row, bg=self.C['surface2'], height=5)
        track.pack(fill='x', pady=(3, 0))
        track.pack_propagate(False)
        fill_w = max(0.0, min(1.0, pct / 100))
        tk.Frame(track, bg=color, height=5).place(relx=0, rely=0,
                                                   relwidth=fill_w, relheight=1.0)

    def show_pet(self):
        self._page_eyebrow("PET")
        self._page_title("Companions")
        self._rule(pady=(4, 16))

        if not self.is_logged_in or not self.auth_token:
            tk.Label(self.content_frame,
                     text="Log in to see your pet.",
                     font=(*self.FONT_MONO, 11),
                     fg=self.C['muted'], bg=self.C['bg']).pack(pady=60)
            return

        all_raw = self.fetch_pets_from_backend()
        pets = []
        for p in all_raw:
            lf = p.get('last_fed') or ''
            if isinstance(lf, str): lf = lf.split('T')[0]
            else: lf = datetime.now().strftime('%Y-%m-%d')
            try:
                last_fed_dt = datetime.strptime(lf, '%Y-%m-%d')
                days_unfed = max(0, (datetime.now() - last_fed_dt).days)
            except Exception:
                days_unfed = 0
            belly = max(0, (p.get('hunger') or 100) - days_unfed * 15)
            bond  = max(0, int(p.get('bond') or 50))
            pets.append({
                'id': p.get('id'), 'name': p.get('name'),
                'type': (p.get('type') or 'cat').lower(),
                'age': p.get('age') or 0,
                'is_alive': p.get('is_alive', True),
                'belly': belly, 'bond': bond,
                'last_fed': lf,
            })

        if not pets:
            tk.Label(self.content_frame,
                     text="No companions yet.",
                     font=(*self.FONT_MONO, 11),
                     fg=self.C['muted'], bg=self.C['bg']).pack(pady=(40, 16))
            self._render_adopt_form(self.content_frame)
            return

        pet = pets[0]
        species = 'dog' if 'dog' in pet['type'] else 'cat'
        stage   = self._pet_stage(pet['age'])
        belly   = pet['belly']
        bond    = pet['bond']
        mood    = self._pet_mood(belly, bond) if pet['is_alive'] else 'sad'

        MOOD_QUOTE = {
            'happy':   'thriving today.',
            'content': 'doing alright.',
            'sleepy':  'needs more time together.',
            'sad':     'feeling a little lonely.',
        }

        # ── layout ────────────────────────────────────────────────────────────
        outer = tk.Frame(self.content_frame, bg=self.C['bg'])
        outer.pack(fill='both', expand=True)

        left = tk.Frame(outer, bg=self.C['bg'], width=260)
        left.pack(side='left', fill='y', padx=(0, 28))
        left.pack_propagate(False)

        right = tk.Frame(outer, bg=self.C['bg'])
        right.pack(side='left', fill='both', expand=True)

        # ── left: sprite ──────────────────────────────────────────────────────
        sprite_bg = self.C['surface'] if pet['is_alive'] else self.C['bg']
        canvas = tk.Canvas(left, width=160, height=160,
                           bg=sprite_bg, highlightthickness=0)
        canvas.pack(pady=(0, 8))
        self._draw_pet_sprite(canvas, species, stage, mood, s=1.5)

        tk.Label(left, text=pet['name'],
                 font=(*self.FONT_SERIF, 18, 'italic'),
                 fg=self.C['ink'], bg=self.C['bg']).pack()

        age_days = int(pet['age'])
        tk.Label(left,
                 text=f"DAY {str(age_days).zfill(3)}  ·  {species}  ·  {stage}",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['bg']).pack(pady=(2, 10))

        tk.Label(left, text=f'"{MOOD_QUOTE[mood]}"',
                 font=(*self.FONT_SERIF, 10, 'italic'),
                 fg=self.C['ink_soft'], bg=self.C['bg']).pack(pady=(0, 14))

        # progress bars
        bars_frame = tk.Frame(left, bg=self.C['bg'])
        bars_frame.pack(fill='x')
        self._pet_stat_bar(bars_frame, "MOOD",  (belly+bond)//2,  self.C['accent'])
        self._pet_stat_bar(bars_frame, "BELLY", belly, self.C['accent2'])
        self._pet_stat_bar(bars_frame, "BOND",  bond,  self.C['amber'])

        if not pet['is_alive']:
            tk.Label(left, text="has passed on.",
                     font=(*self.FONT_SERIF, 10, 'italic'),
                     fg=self.C['muted'], bg=self.C['bg']).pack(pady=(10, 0))

        # action buttons
        acts = tk.Frame(left, bg=self.C['bg'])
        acts.pack(pady=(14, 0), anchor='w')
        xp = self.user_data.get('xp', 0)
        feed_state = 'normal' if pet['is_alive'] and xp >= 35 else 'disabled'
        feed_btn = self._primary_btn(acts, "Offer a treat  ·  35 xp",
                                     lambda: self.feed_pet(pet))
        feed_btn.config(state=feed_state)
        feed_btn.pack(side='left', padx=(0, 8))

        # ── right: adopt form ─────────────────────────────────────────────────
        self._section_label(right, "Meet a new companion")
        self._render_adopt_form(right)

        # past companions (other pets)
        others = [p for p in pets if p['id'] != pet['id']]
        if others:
            tk.Frame(right, bg=self.C['rule'], height=1).pack(fill='x', pady=(16, 0))
            self._section_label(right, "Other companions")
            for op in others:
                row = tk.Frame(right, bg=self.C['surface2'])
                row.pack(fill='x', pady=3)
                sp2 = 'dog' if 'dog' in op['type'] else 'cat'
                st2 = self._pet_stage(op['age'])
                mini = tk.Canvas(row, width=32, height=32,
                                 bg=self.C['surface2'], highlightthickness=0)
                mini.pack(side='left', padx=(8, 6), pady=4)
                self._draw_pet_sprite(mini, sp2, st2, 'content', s=0.30)
                tk.Label(row, text=f"{op['name']}  ·  {sp2}  ·  DAY {str(int(op['age'])).zfill(3)}",
                         font=(*self.FONT_MONO, 9),
                         fg=self.C['ink_soft'], bg=self.C['surface2']).pack(side='left', padx=4)

    def _render_adopt_form(self, parent):
        """Inline adopt form: name + Dog/Cat toggle + Adopt button."""
        form = tk.Frame(parent, bg=self.C['bg'])
        form.pack(anchor='w', pady=(4, 0))

        name_var    = tk.StringVar(value='')
        species_var = tk.StringVar(value='cat')

        name_entry = tk.Entry(form,
                              textvariable=name_var,
                              font=(*self.FONT_SANS, 11),
                              bg=self.C['surface2'], fg=self.C['ink'],
                              insertbackground=self.C['ink'],
                              relief='flat', bd=0,
                              highlightthickness=1,
                              highlightbackground=self.C['rule'],
                              highlightcolor=self.C['accent'],
                              width=22)
        name_entry.pack(fill='x', pady=(0, 8))

        # Dog / Cat toggle row
        toggle_row = tk.Frame(form, bg=self.C['bg'])
        toggle_row.pack(anchor='w', pady=(0, 12))

        def _pick(sp):
            species_var.set(sp)
            dog_btn.config(fg=self.C['accent'] if sp=='dog' else self.C['muted'],
                           bg=self.C['hi']       if sp=='dog' else self.C['surface2'])
            cat_btn.config(fg=self.C['accent'] if sp=='cat' else self.C['muted'],
                           bg=self.C['hi']       if sp=='cat' else self.C['surface2'])

        dog_btn = tk.Button(toggle_row, text="Dog",
                            font=(*self.FONT_MONO, 9),
                            fg=self.C['muted'], bg=self.C['surface2'],
                            border=0, padx=12, pady=5, cursor='hand2',
                            command=lambda: _pick('dog'))
        dog_btn.pack(side='left', padx=(0, 6))
        cat_btn = tk.Button(toggle_row, text="Cat",
                            font=(*self.FONT_MONO, 9),
                            fg=self.C['accent'], bg=self.C['hi'],
                            border=0, padx=12, pady=5, cursor='hand2',
                            command=lambda: _pick('cat'))
        cat_btn.pack(side='left')

        def _do_adopt():
            nm = name_var.get().strip()
            if not nm:
                messagebox.showinfo("Name needed", "Give your companion a name first.")
                return
            sp = species_var.get()
            result = self.create_pet_in_backend(nm, sp)
            if result:
                self.switch_page("pet")
            else:
                messagebox.showerror("Error", "Could not adopt pet right now.")

        self._primary_btn(form, "Adopt  →", _do_adopt).pack(anchor='w')

    def feed_pet(self, pet):
        if not pet['is_alive']:
            messagebox.showinfo("Pet passed", "Adopt a new companion.")
            return
        if self.is_logged_in and self.auth_token:
            result = self.feed_pet_in_backend(pet['id'])
            if result:
                self.switch_page("pet")
            else:
                messagebox.showerror("Error", "Could not feed pet right now.")
        else:
            pet['belly'] = 100
            pet['last_fed'] = datetime.now().strftime('%Y-%m-%d')
            self.save_current_pet(pet)
            self.switch_page("pet")

    def adopt_pet(self):
        if not self.is_logged_in or not self.auth_token:
            self.show_login_required_popup("adopt pets")
            return
        self.switch_page("pet")

    def switch_pet(self, pet_id):
        if not (self.is_logged_in and self.auth_token):
            self.user_data['current_pet_id'] = pet_id
            self.save_user_data()
        self.switch_page("pet")

    # ─── Ledger (Analytics) ───────────────────────────────────────────────────

    def _blend_hex(self, c1, c2, t):
        """Blend two #rrggbb hex colors: t=0 → c1, t=1 → c2."""
        r1,g1,b1 = int(c1[1:3],16), int(c1[3:5],16), int(c1[5:7],16)
        r2,g2,b2 = int(c2[1:3],16), int(c2[3:5],16), int(c2[5:7],16)
        r = int(r1 + (r2-r1)*t); g = int(g1 + (g2-g1)*t); b = int(b1 + (b2-b1)*t)
        return f'#{r:02x}{g:02x}{b:02x}'

    def show_analytics(self):
        self._page_eyebrow("LEDGER")
        self._page_title("The record.")
        tk.Label(self.content_frame,
                 text="Everything you have done, quietly counted.",
                 font=(*self.FONT_SERIF, 11, 'italic'),
                 fg=self.C['ink_soft'], bg=self.C['bg'],
                 anchor='w').pack(anchor='w', pady=(2, 0))
        self._rule(pady=(10, 16))

        if not self.is_logged_in or not self.auth_token:
            tk.Label(self.content_frame,
                     text="Log in to see your record.",
                     font=(*self.FONT_MONO, 11),
                     fg=self.C['muted'], bg=self.C['bg']).pack(pady=60)
            return

        # ── fetch data ────────────────────────────────────────────────────────
        tasks = self.fetch_tasks_from_backend()
        user_id = next((t.get('user_id') for t in tasks if t.get('user_id')), None)
        stats   = self.fetch_stats_from_backend(user_id) if user_id else {}
        focus   = self.fetch_focus_total_from_backend()

        streak       = stats.get('streaks', 0) or 0
        tasks_done   = stats.get('num_task_completed') or len([t for t in tasks if t.get('completed')])
        focus_secs   = focus.get('total_seconds', 0) or 0
        focus_hrs    = focus_secs // 3600
        focus_mins   = (focus_secs % 3600) // 60
        if focus_hrs == 0:
            focus_disp = f"{focus_mins} min"
        elif focus_mins == 0:
            focus_disp = f"{focus_hrs} hr{'s' if focus_hrs != 1 else ''}"
        else:
            focus_disp = f"{focus_hrs} hr{'s' if focus_hrs != 1 else ''} {focus_mins} min"

        # ── 3 top stat cards ──────────────────────────────────────────────────
        top = tk.Frame(self.content_frame, bg=self.C['bg'])
        top.pack(fill='x', pady=(0, 16))

        for col, (label, value, color) in enumerate([
            ("TASKS FINISHED",  str(tasks_done), self.C['accent']),
            ("TIME TOGETHER",   focus_disp,       self.C['accent3']),
            ("STREAK",          f"{streak} days", self.C['amber']),
        ]):
            c = tk.Frame(top, bg=self.C['surface'],
                         highlightthickness=1,
                         highlightbackground=self.C['rule'])
            c.grid(row=0, column=col, padx=(0 if col==0 else 10, 0), sticky='nsew')
            top.grid_columnconfigure(col, weight=1)
            tk.Label(c, text=label, font=(*self.FONT_MONO, 8),
                     fg=self.C['muted'], bg=self.C['surface'],
                     anchor='w').pack(anchor='w', padx=16, pady=(14, 2))
            tk.Label(c, text=value,
                     font=(*self.FONT_SERIF, 30, 'italic'),
                     fg=color, bg=self.C['surface'],
                     anchor='w').pack(anchor='w', padx=16, pady=(0, 14))

        # ── 21-day heatmap ─────────────────────────────────────────────────────
        today = datetime.now().date()
        day_counts_21 = []
        for i in range(20, -1, -1):
            d = today - timedelta(days=i)
            cnt = sum(
                1 for t in tasks
                if t.get('completed') and t.get('created_at', '')[:10] == d.strftime('%Y-%m-%d')
            )
            day_counts_21.append(cnt)
        max21 = max(max(day_counts_21), 1)

        hm21_card = tk.Frame(self.content_frame, bg=self.C['surface'],
                             highlightthickness=1, highlightbackground=self.C['rule'])
        hm21_card.pack(fill='x', pady=(0, 14))

        tk.Label(hm21_card, text="LAST 21 DAYS",
                 font=(*self.FONT_MONO, 8), fg=self.C['muted'],
                 bg=self.C['surface'], anchor='w').pack(anchor='w', padx=16, pady=(12, 6))

        row_21 = tk.Frame(hm21_card, bg=self.C['surface'])
        row_21.pack(fill='x', padx=16, pady=(0, 4))
        for cnt in day_counts_21:
            t = 0.0 if cnt == 0 else max(0.15, 0.15 + 0.85 * cnt / max21)
            bg = self._blend_hex(self.C['surface2'], self.C['accent'], t)
            cell = tk.Frame(row_21, bg=bg, height=20,
                            highlightthickness=1,
                            highlightbackground=self.C['rule'])
            cell.pack(side='left', fill='x', expand=True, padx=1)

        leg21 = tk.Frame(hm21_card, bg=self.C['surface'])
        leg21.pack(fill='x', padx=16, pady=(2, 10))
        tk.Label(leg21, text="21 D AGO", font=(*self.FONT_MONO, 7),
                 fg=self.C['muted'], bg=self.C['surface']).pack(side='left')
        tk.Label(leg21, text="each square, a day",
                 font=(*self.FONT_SERIF, 9, 'italic'),
                 fg=self.C['muted'], bg=self.C['surface']).pack(side='left', expand=True)
        tk.Label(leg21, text="TODAY", font=(*self.FONT_MONO, 7),
                 fg=self.C['muted'], bg=self.C['surface']).pack(side='right')

        # ── monthly calendar heatmap ──────────────────────────────────────────
        if not hasattr(self, '_ldg_month'):
            self._ldg_month = today.month   # 1-indexed
            self._ldg_year  = today.year

        vm, vy = self._ldg_month, self._ldg_year
        _, days_in_month = calendar.monthrange(vy, vm)
        first_weekday    = calendar.monthrange(vy, vm)[0]  # 0=Mon
        month_name       = datetime(vy, vm, 1).strftime('%B')

        month_counts = [0] * days_in_month
        for t in tasks:
            if not t.get('completed'): continue
            ds = (t.get('created_at') or '')[:10]
            try:
                d = datetime.strptime(ds, '%Y-%m-%d')
                if d.year == vy and d.month == vm:
                    month_counts[d.day - 1] += 1
            except Exception:
                pass
        max_month = max(max(month_counts), 1)
        total_month = sum(month_counts)

        cal_card = tk.Frame(self.content_frame, bg=self.C['surface'],
                            highlightthickness=1, highlightbackground=self.C['rule'])
        cal_card.pack(fill='x', pady=(0, 14))

        # calendar header
        cal_hdr = tk.Frame(cal_card, bg=self.C['surface'])
        cal_hdr.pack(fill='x', padx=16, pady=(12, 8))

        tk.Label(cal_hdr, text="MONTHLY VIEW",
                 font=(*self.FONT_MONO, 8), fg=self.C['muted'],
                 bg=self.C['surface']).pack(anchor='w')
        tk.Label(cal_hdr,
                 text=f"{month_name} {vy}.",
                 font=(*self.FONT_SERIF, 18, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(anchor='w')
        tk.Label(cal_hdr,
                 text=f"{total_month} task{'s' if total_month != 1 else ''} completed",
                 font=(*self.FONT_MONO, 8), fg=self.C['muted'],
                 bg=self.C['surface']).pack(anchor='w', pady=(2, 0))

        is_current = (vm == today.month and vy == today.year)

        nav_row = tk.Frame(cal_card, bg=self.C['surface'])
        nav_row.pack(anchor='e', padx=16, pady=(0, 8))

        def _go_back():
            if self._ldg_month == 1:
                self._ldg_month = 12; self._ldg_year -= 1
            else:
                self._ldg_month -= 1
            self.switch_page('ledger')

        def _go_fwd():
            if is_current: return
            if self._ldg_month == 12:
                self._ldg_month = 1; self._ldg_year += 1
            else:
                self._ldg_month += 1
            self.switch_page('ledger')

        tk.Button(nav_row, text=" ‹ ", font=(*self.FONT_MONO, 11),
                  fg=self.C['ink_soft'], bg=self.C['surface2'],
                  border=0, padx=8, pady=4, cursor='hand2',
                  command=_go_back).pack(side='left', padx=(0, 4))
        tk.Button(nav_row, text=" › ", font=(*self.FONT_MONO, 11),
                  fg=self.C['muted'] if is_current else self.C['ink_soft'],
                  bg=self.C['surface2'],
                  border=0, padx=8, pady=4,
                  cursor='arrow' if is_current else 'hand2',
                  command=_go_fwd).pack(side='left')

        # day-of-week labels
        dow_row = tk.Frame(cal_card, bg=self.C['surface'])
        dow_row.pack(fill='x', padx=16, pady=(0, 3))
        for d in ['M', 'T', 'W', 'T', 'F', 'S', 'S']:
            tk.Label(dow_row, text=d, font=(*self.FONT_MONO, 8),
                     fg=self.C['muted'], bg=self.C['surface'],
                     width=3, anchor='center').pack(side='left', expand=True, fill='x')

        # calendar grid
        grid_frame = tk.Frame(cal_card, bg=self.C['surface'])
        grid_frame.pack(fill='x', padx=16, pady=(0, 4))

        cell_col = 0; cell_row = 0
        for _ in range(7): grid_frame.grid_columnconfigure(_, weight=1)

        # empty offset cells
        for _ in range(first_weekday):
            tk.Frame(grid_frame, bg=self.C['surface'], height=28).grid(
                row=0, column=cell_col, padx=1, pady=1, sticky='nsew')
            cell_col += 1

        for day_idx, cnt in enumerate(month_counts):
            day_num = day_idx + 1
            is_today_cell = is_current and day_num == today.day
            t = 0.0 if cnt == 0 else max(0.2, 0.2 + 0.8 * cnt / max_month)
            bg = self._blend_hex(self.C['surface2'], self.C['accent'], t)
            hl = self.C['accent'] if is_today_cell else self.C['rule']

            cell = tk.Frame(grid_frame, bg=bg, height=28,
                            highlightthickness=1, highlightbackground=hl)
            cell.grid(row=cell_row, column=cell_col, padx=1, pady=1, sticky='nsew')
            tk.Label(cell, text=str(day_num), font=(*self.FONT_MONO, 7),
                     fg=self.C['ink'] if cnt > 0 else self.C['muted'],
                     bg=bg).pack(expand=True)

            cell_col += 1
            if cell_col == 7: cell_col = 0; cell_row += 1

        cal_leg = tk.Frame(cal_card, bg=self.C['surface'])
        cal_leg.pack(fill='x', padx=16, pady=(2, 12))
        tk.Label(cal_leg, text="NO ACTIVITY", font=(*self.FONT_MONO, 7),
                 fg=self.C['muted'], bg=self.C['surface']).pack(side='left')
        tk.Label(cal_leg, text="each square, a day",
                 font=(*self.FONT_SERIF, 9, 'italic'),
                 fg=self.C['muted'], bg=self.C['surface']).pack(side='left', expand=True)
        tk.Label(cal_leg, text="MOST ACTIVE", font=(*self.FONT_MONO, 7),
                 fg=self.C['muted'], bg=self.C['surface']).pack(side='right')

        # ── bottom two columns ────────────────────────────────────────────────
        bot = tk.Frame(self.content_frame, bg=self.C['bg'])
        bot.pack(fill='x')
        bot.grid_columnconfigure(0, weight=1)
        bot.grid_columnconfigure(1, weight=1)

        # Priority breakdown (left)
        prio_card = tk.Frame(bot, bg=self.C['surface'],
                             highlightthickness=1, highlightbackground=self.C['rule'])
        prio_card.grid(row=0, column=0, padx=(0, 8), sticky='nsew')

        tk.Label(prio_card, text="BY PRIORITY",
                 font=(*self.FONT_MONO, 8), fg=self.C['muted'],
                 bg=self.C['surface'], anchor='w').pack(anchor='w', padx=16, pady=(14, 4))
        tk.Label(prio_card, text="Where your effort went.",
                 font=(*self.FONT_SERIF, 13, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=16, pady=(0, 12))

        prio_counts = {}
        for t in tasks:
            if not t.get('completed'): continue
            p = (t.get('priority') or 'low').upper()
            prio_counts[p] = prio_counts.get(p, 0) + 1

        prio_colors = {'HIGH': self.C['accent'], 'MEDIUM': self.C['accent3'], 'LOW': self.C['accent2']}
        pmax = max(max(prio_counts.values()) if prio_counts else 1, 1)

        if not prio_counts:
            tk.Label(prio_card, text="no completed tasks yet.",
                     font=(*self.FONT_SERIF, 11, 'italic'),
                     fg=self.C['muted'], bg=self.C['surface'],
                     anchor='w').pack(anchor='w', padx=16, pady=(0, 16))
        else:
            for p in ['HIGH', 'MEDIUM', 'LOW']:
                if p not in prio_counts: continue
                cnt = prio_counts[p]
                pr = tk.Frame(prio_card, bg=self.C['surface'])
                pr.pack(fill='x', padx=16, pady=(0, 10))
                lrow = tk.Frame(pr, bg=self.C['surface'])
                lrow.pack(fill='x')
                tk.Label(lrow, text=p, font=(*self.FONT_MONO, 8),
                         fg=self.C['muted'], bg=self.C['surface']).pack(side='left')
                tk.Label(lrow, text=str(cnt), font=(*self.FONT_MONO, 9),
                         fg=self.C['ink_soft'], bg=self.C['surface']).pack(side='right')
                track = tk.Frame(pr, bg=self.C['surface2'], height=5)
                track.pack(fill='x', pady=(3, 0))
                track.pack_propagate(False)
                tk.Frame(track, bg=prio_colors.get(p, self.C['accent']),
                         height=5).place(relx=0, rely=0, relwidth=cnt/pmax, relheight=1.0)
            tk.Frame(prio_card, bg=self.C['surface'], height=4).pack()

        # Streak card (right)
        streak_card = tk.Frame(bot, bg=self.C['surface'],
                               highlightthickness=1, highlightbackground=self.C['rule'])
        streak_card.grid(row=0, column=1, padx=(8, 0), sticky='nsew')

        tk.Label(streak_card, text="STREAK",
                 font=(*self.FONT_MONO, 8), fg=self.C['muted'],
                 bg=self.C['surface'], anchor='w').pack(anchor='w', padx=16, pady=(14, 4))
        tk.Label(streak_card, text="Continuity is the point.",
                 font=(*self.FONT_SERIF, 13, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=16, pady=(0, 8))

        streak_row = tk.Frame(streak_card, bg=self.C['surface'])
        streak_row.pack(anchor='w', padx=16, pady=(0, 10))
        tk.Label(streak_row, text=str(streak),
                 font=(*self.FONT_SERIF, 48, 'italic'),
                 fg=self.C['amber'], bg=self.C['surface']).pack(side='left')
        tk.Label(streak_row, text="  days\nrunning",
                 font=(*self.FONT_SERIF, 13, 'italic'),
                 fg=self.C['ink_soft'], bg=self.C['surface'],
                 justify='left').pack(side='left', anchor='s', pady=(0, 6))

        tk.Frame(streak_card, bg=self.C['rule'], height=1).pack(fill='x', padx=16)
        streak_msg = (
            'A proper run. Keep the thread.' if streak >= 7 else
            'Three days in. Keep going.'     if streak >= 3 else
            'Started. The hardest part.'     if streak >= 1 else
            'Not yet. Tomorrow is fine.'
        )
        tk.Label(streak_card, text=streak_msg,
                 font=(*self.FONT_SERIF, 11, 'italic'),
                 fg=self.C['ink_soft'], bg=self.C['surface'],
                 anchor='w', wraplength=280, justify='left').pack(
                     anchor='w', padx=16, pady=(10, 16))

    # ─── Archive (Settings) ───────────────────────────────────────────────────

    def show_settings(self):
        self._page_eyebrow("ARCHIVE")
        self._page_title("Settings")
        self._rule(pady=(4, 20))

        wrap = tk.Frame(self.content_frame, bg=self.C['bg'])
        wrap.pack(fill='both', expand=True)

        # Auth card
        auth_card = tk.Frame(wrap, bg=self.C['surface'],
                             highlightthickness=1,
                             highlightbackground=self.C['rule'])
        auth_card.pack(fill='x', pady=(0, 12))

        tk.Label(auth_card, text="ACCOUNT",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=20, pady=(16, 8))

        if self.is_logged_in:
            tk.Label(auth_card,
                     text=f"{self.current_username}  ·  {self.current_email}",
                     font=(*self.FONT_SANS, 12),
                     fg=self.C['ink'], bg=self.C['surface'],
                     anchor='w').pack(anchor='w', padx=20, pady=(0, 12))

            btn_row = tk.Frame(auth_card, bg=self.C['surface'])
            btn_row.pack(anchor='w', padx=20, pady=(0, 16))

            self._primary_btn(btn_row, "Log out", self.logout).pack(side='left', padx=(0, 8))

            tk.Button(btn_row, text="Reset password",
                      font=(*self.FONT_MONO, 9),
                      fg=self.C['muted'], bg=self.C['surface'],
                      activeforeground=self.C['accent3'],
                      border=0, cursor='hand2',
                      command=self.show_forgot_password_form).pack(side='left', padx=8)

            tk.Button(btn_row, text="Delete account",
                      font=(*self.FONT_MONO, 9),
                      fg=self.C['accent'], bg=self.C['surface'],
                      activeforeground='#c9604a',
                      border=0, cursor='hand2',
                      command=self.show_delete_account_warning).pack(side='left', padx=8)
        else:
            tk.Label(auth_card, text="Not logged in",
                     font=(*self.FONT_SANS, 12),
                     fg=self.C['muted'], bg=self.C['surface'],
                     anchor='w').pack(anchor='w', padx=20, pady=(0, 12))

            btn_row = tk.Frame(auth_card, bg=self.C['surface'])
            btn_row.pack(anchor='w', padx=20, pady=(0, 16))

            self._primary_btn(btn_row, "Log in",
                              self.show_login_form).pack(side='left', padx=(0, 8))
            self._ghost_btn(btn_row, "Sign up",
                            self.show_signup_form).pack(side='left')

        # Data card
        data_card = tk.Frame(wrap, bg=self.C['surface'],
                             highlightthickness=1,
                             highlightbackground=self.C['rule'])
        data_card.pack(fill='x', pady=(0, 12))

        tk.Label(data_card, text="DATA",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=20, pady=(16, 8))

        data_row = tk.Frame(data_card, bg=self.C['surface'])
        data_row.pack(anchor='w', padx=20, pady=(0, 16))

        self._ghost_btn(data_row, "Export data",
                        self.export_data).pack(side='left', padx=(0, 8))
        tk.Button(data_row, text="Reset progress",
                  font=(*self.FONT_MONO, 9),
                  fg=self.C['accent'], bg=self.C['surface'],
                  activeforeground='#c9604a',
                  border=0, cursor='hand2',
                  command=self.reset_progress).pack(side='left')

        # About card
        about_card = tk.Frame(wrap, bg=self.C['surface'],
                              highlightthickness=1,
                              highlightbackground=self.C['rule'])
        about_card.pack(fill='x')

        tk.Label(about_card, text="ABOUT",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=20, pady=(16, 8))

        tk.Label(about_card,
                 text="Tendr v1.0  ·  A focused life, one day at a time.",
                 font=(*self.FONT_SERIF, 12, 'italic'),
                 fg=self.C['ink_soft'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=20, pady=(0, 16))

    # ─── data actions ─────────────────────────────────────────────────────────

    def export_data(self):
        try:
            from tkinter import filedialog
            fn = filedialog.asksaveasfilename(
                defaultextension=".json",
                filetypes=[("JSON", "*.json"), ("All files", "*.*")])
            if fn:
                with open(fn, 'w') as f:
                    json.dump(self.user_data, f, indent=2)
                messagebox.showinfo("Exported", "Data saved.")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def reset_progress(self):
        if messagebox.askyesno("Reset", "Reset all progress? This cannot be undone."):
            self.user_data = {
                'pets': [], 'current_pet_id': 0, 'xp': 0, 'streak': 0,
                'tasks': [], 'completed_tasks': 0, 'focus_sessions': 0,
                'total_focus_time': 0, 'achievements': [], 'theme': 'tendr',
            }
            self.save_user_data()
            self.update_sidebar_stats()
            messagebox.showinfo("Reset", "Progress cleared.")
            self.switch_page("today")

    # ─── popups / dialogs ─────────────────────────────────────────────────────

    def _dialog_base(self, title, w=440, h=480):
        win = tk.Toplevel(self.root)
        win.title(title)
        win.geometry(f"{w}x{h}")
        win.configure(bg=self.C['bg'])
        win.resizable(False, False)
        win.transient(self.root)
        win.grab_set()

        # center
        win.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() - w) // 2
        y = self.root.winfo_y() + (self.root.winfo_height() - h) // 2
        win.geometry(f"{w}x{h}+{x}+{y}")

        body = tk.Frame(win, bg=self.C['surface'],
                        highlightthickness=1,
                        highlightbackground=self.C['rule'])
        body.pack(fill='both', expand=True, padx=20, pady=20)
        return win, body

    def show_login_required_popup(self, action):
        popup = tk.Toplevel()
        popup.overrideredirect(True)
        popup.configure(bg=self.C['bg'])
        popup.geometry("360x180")
        popup.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() - 360) // 2
        y = self.root.winfo_y() + (self.root.winfo_height() - 180) // 2
        popup.geometry(f"+{x}+{y}")

        frame = tk.Frame(popup, bg=self.C['surface'],
                         highlightthickness=1,
                         highlightbackground=self.C['rule'])
        frame.pack(fill='both', expand=True, padx=2, pady=2)

        top = tk.Frame(frame, bg=self.C['surface'])
        top.pack(fill='x')

        tk.Label(top, text="Login required",
                 font=(*self.FONT_SERIF, 13, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(side='left', padx=16, pady=12)

        tk.Button(top, text="×", font=(*self.FONT_SANS, 14),
                  fg=self.C['muted'], bg=self.C['surface'],
                  activeforeground=self.C['accent'],
                  border=0, cursor='hand2',
                  command=popup.destroy).pack(side='right', padx=12)

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16)

        tk.Label(frame,
                 text=f"You need to be logged in to {action}.",
                 font=(*self.FONT_SANS, 10),
                 fg=self.C['ink_soft'], bg=self.C['surface'],
                 justify='center').pack(pady=12)

        btns = tk.Frame(frame, bg=self.C['surface'])
        btns.pack(pady=4)

        self._primary_btn(btns, "Log in",
                          lambda: [popup.destroy(), self.show_login_form()]
                          ).pack(side='left', padx=6)
        self._ghost_btn(btns, "Sign up",
                        lambda: [popup.destroy(), self.show_signup_form()]
                        ).pack(side='left', padx=6)

    def show_login_form(self):
        win, frame = self._dialog_base("Login", 420, 480)

        tk.Label(frame, text="Log in to Tendr",
                 font=(*self.FONT_SERIF, 18, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(pady=(20, 16))

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(0, 16))

        tk.Label(frame, text="USERNAME OR EMAIL",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=20)
        u_entry = self._input(frame, width=32)
        u_entry.pack(padx=20, pady=(4, 12), ipady=5)

        tk.Label(frame, text="PASSWORD",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface'],
                 anchor='w').pack(anchor='w', padx=20)
        p_entry = self._input(frame, width=32, show='*')
        p_entry.pack(padx=20, pady=(4, 20), ipady=5)

        btn_row = tk.Frame(frame, bg=self.C['surface'])
        btn_row.pack(padx=20, pady=(0, 12))

        self._primary_btn(btn_row, "Log in",
                          lambda: self.login_user(u_entry.get(), p_entry.get(), win)
                          ).pack(side='left', padx=(0, 8))

        tk.Button(btn_row, text="Forgot password?",
                  font=(*self.FONT_MONO, 9),
                  fg=self.C['muted'], bg=self.C['surface'],
                  activeforeground=self.C['accent3'],
                  border=0, cursor='hand2',
                  command=self.show_forgot_password_form).pack(side='left')

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(4, 12))

        google_row = tk.Frame(frame, bg=self.C['surface'])
        google_row.pack(padx=20)

        tk.Button(google_row, text="Continue with Google",
                  font=(*self.FONT_SANS, 11),
                  fg=self.C['ink'], bg='#4285F4',
                  activebackground='#3367D6',
                  activeforeground=self.C['ink'],
                  border=0, pady=9, padx=16, cursor='hand2',
                  command=lambda: [win.destroy(), self.google_login()]).pack(fill='x')

        u_entry.focus()
        win.bind('<Return>',
                 lambda e: self.login_user(u_entry.get(), p_entry.get(), win))

    def show_signup_form(self):
        win, frame = self._dialog_base("Sign up", 420, 540)

        tk.Label(frame, text="Join Tendr",
                 font=(*self.FONT_SERIF, 18, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(pady=(20, 16))

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(0, 16))

        entries = {}
        for key, label, show in [
            ('username', 'USERNAME', None),
            ('email',    'EMAIL',    None),
            ('password', 'PASSWORD', '*'),
            ('confirm',  'CONFIRM PASSWORD', '*'),
        ]:
            tk.Label(frame, text=label,
                     font=(*self.FONT_MONO, 8),
                     fg=self.C['muted'], bg=self.C['surface'],
                     anchor='w').pack(anchor='w', padx=20)
            e = self._input(frame, width=32, show=show)
            e.pack(padx=20, pady=(4, 10), ipady=5)
            entries[key] = e

        btn_row = tk.Frame(frame, bg=self.C['surface'])
        btn_row.pack(padx=20, pady=(8, 8))

        self._primary_btn(btn_row, "Create account",
                          lambda: self.register_user(
                              entries['username'].get(),
                              entries['email'].get(),
                              entries['password'].get(),
                              entries['confirm'].get(), win)
                          ).pack(side='left', padx=(0, 8))

        self._ghost_btn(btn_row, "Cancel", win.destroy).pack(side='left')

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(4, 12))

        google_row = tk.Frame(frame, bg=self.C['surface'])
        google_row.pack(padx=20)

        tk.Button(google_row, text="Sign up with Google",
                  font=(*self.FONT_SANS, 11),
                  fg=self.C['ink'], bg='#4285F4',
                  activebackground='#3367D6',
                  border=0, pady=9, padx=16, cursor='hand2',
                  command=lambda: [win.destroy(), self.google_signup()]).pack(fill='x')

        entries['username'].focus()
        win.bind('<Return>',
                 lambda e: self.register_user(
                     entries['username'].get(), entries['email'].get(),
                     entries['password'].get(), entries['confirm'].get(), win))

    def show_email_verification_form(self, username, email):
        win, frame = self._dialog_base("Verify email", 400, 360)

        tk.Label(frame, text="Verify your email",
                 font=(*self.FONT_SERIF, 16, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(pady=(20, 10))

        tk.Label(frame,
                 text=f"We sent a code to:\n{email}",
                 font=(*self.FONT_SANS, 11),
                 fg=self.C['ink_soft'], bg=self.C['surface'],
                 justify='center').pack(pady=(0, 16))

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(0, 16))

        tk.Label(frame, text="VERIFICATION CODE",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface']).pack()

        code_entry = self._input(frame, width=20)
        code_entry.pack(pady=(4, 20), ipady=6)

        btn_row = tk.Frame(frame, bg=self.C['surface'])
        btn_row.pack()

        self._primary_btn(btn_row, "Verify",
                          lambda: self.verify_email(code_entry.get(), win)
                          ).pack(side='left', padx=6)
        self._ghost_btn(btn_row, "Resend",
                        lambda: self.resend_verification_code(email)
                        ).pack(side='left', padx=6)

        code_entry.focus()
        win.bind('<Return>',
                 lambda e: self.verify_email(code_entry.get(), win))

    def show_forgot_password_form(self):
        win, frame = self._dialog_base("Reset password", 380, 260)

        tk.Label(frame, text="Reset password",
                 font=(*self.FONT_SERIF, 16, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(pady=(20, 10))

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(0, 16))

        tk.Label(frame, text="YOUR EMAIL",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface']).pack()

        email_entry = self._input(frame, width=30)
        email_entry.pack(pady=(4, 20), ipady=5)

        def send_otp():
            email = email_entry.get().strip()
            if not email:
                messagebox.showerror("Error", "Email is required.")
                return
            try:
                r = requests.post(f"{self.backend_url}/send_forgot_password_otp",
                                  params={"email": email}, timeout=10)
                if r.status_code == 200:
                    messagebox.showinfo("Sent", "OTP sent to your email.")
                    win.destroy()
                    self.show_reset_password_form(email)
                else:
                    messagebox.showerror("Error", r.json().get("detail", "Failed."))
            except Exception as e:
                messagebox.showerror("Error", str(e))

        btn_row = tk.Frame(frame, bg=self.C['surface'])
        btn_row.pack()

        self._primary_btn(btn_row, "Send OTP", send_otp).pack(side='left', padx=6)
        self._ghost_btn(btn_row, "Cancel", win.destroy).pack(side='left', padx=6)

    # kept for backwards compat (login form references this name)
    def show_password_forgot_form(self):
        self.show_forgot_password_form()

    def show_reset_password_form(self, email):
        win, frame = self._dialog_base("Reset password", 400, 460)

        tk.Label(frame, text="Choose a new password",
                 font=(*self.FONT_SERIF, 16, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(pady=(20, 6))

        tk.Label(frame, text=f"OTP sent to: {email}",
                 font=(*self.FONT_MONO, 9),
                 fg=self.C['muted'], bg=self.C['surface']).pack(pady=(0, 12))

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(0, 16))

        fields = {}
        for key, label, show in [
            ('otp',      'ONE-TIME CODE', None),
            ('username', 'USERNAME',      None),
            ('pass1',    'NEW PASSWORD',  '*'),
            ('pass2',    'CONFIRM',       '*'),
        ]:
            tk.Label(frame, text=label,
                     font=(*self.FONT_MONO, 8),
                     fg=self.C['muted'], bg=self.C['surface']).pack()
            e = self._input(frame, width=28, show=show)
            e.pack(pady=(4, 10), ipady=5)
            fields[key] = e

        def reset():
            otp = fields['otp'].get().strip()
            uname = fields['username'].get().strip()
            pw1 = fields['pass1'].get().strip()
            pw2 = fields['pass2'].get().strip()
            if not all([otp, uname, pw1, pw2]):
                messagebox.showerror("Error", "Fill all fields.")
                return
            if pw1 != pw2:
                messagebox.showerror("Error", "Passwords do not match.")
                return
            self.reset_password_backend(uname, otp, pw1, pw2, win)

        self._primary_btn(frame, "Reset password", reset).pack(pady=(4, 0))

    def show_delete_account_warning(self):
        msg = ("This action is permanent and cannot be undone.\n\n"
               "Deleting your account removes all tasks, pets, and progress.\n\n"
               "Proceed?")
        if messagebox.askyesno("Delete account", msg, icon='warning'):
            self.show_delete_account_password_form()

    def show_delete_account_password_form(self):
        win, frame = self._dialog_base("Delete account", 420, 320)

        tk.Label(frame, text="Confirm deletion",
                 font=(*self.FONT_SERIF, 16, 'italic'),
                 fg=self.C['accent'], bg=self.C['surface']).pack(pady=(20, 8))

        tk.Label(frame, text="Enter your password to confirm.",
                 font=(*self.FONT_SANS, 11),
                 fg=self.C['ink_soft'], bg=self.C['surface'],
                 justify='center').pack(pady=(0, 16))

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(0, 16))

        tk.Label(frame, text="PASSWORD",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface']).pack()
        pw = self._input(frame, width=28, show='*')
        pw.pack(pady=(4, 20), ipady=5)

        btn_row = tk.Frame(frame, bg=self.C['surface'])
        btn_row.pack()

        tk.Button(btn_row, text="Delete account",
                  font=(*self.FONT_SANS, 10, 'bold'),
                  fg=self.C['bg'], bg=self.C['accent'],
                  activebackground='#c9604a',
                  border=0, padx=14, pady=7, cursor='hand2',
                  command=lambda: self.delete_account(pw.get(), win)
                  ).pack(side='left', padx=6)
        self._ghost_btn(btn_row, "Cancel", win.destroy).pack(side='left', padx=6)

        pw.focus()
        win.bind('<Return>', lambda e: self.delete_account(pw.get(), win))

    # ─── auth actions ─────────────────────────────────────────────────────────

    def login_user(self, username, password, window):
        if not username or not password:
            messagebox.showerror("Error", "Fill all fields.")
            return
        try:
            r = requests.post(f"{self.backend_url}/token",
                              data={"username": username, "password": password},
                              timeout=10)
            if r.status_code == 200:
                data = r.json()
                self.auth_token = data.get("access_token")
                self.current_username = data.get("username")
                self.current_email = data.get("email")
                self.is_logged_in = True
                self.user_data['xp'] = self.fetch_user_xp_from_backend()
                self.save_user_data()
                self.update_sidebar_stats()
                messagebox.showinfo("Welcome", f"Good to have you back, {username}.")
                window.destroy()
                self.switch_page("archive")
            else:
                messagebox.showerror("Login failed", "Invalid username or password.")
        except requests.exceptions.ConnectionError:
            messagebox.showerror("Connection error",
                                 "Could not reach the server. Try again later.")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def register_user(self, username, email, password, confirm, window):
        if not all([username, email, password, confirm]):
            messagebox.showerror("Error", "Fill all fields.")
            return
        if password != confirm:
            messagebox.showerror("Error", "Passwords do not match.")
            return
        if len(password) < 6:
            messagebox.showerror("Error", "Password must be at least 6 characters.")
            return
        try:
            r = requests.post(f"{self.backend_url}/register",
                              json={"username": username, "password": password,
                                    "email": email},
                              timeout=10)
            if r.ok:
                result = r.json()
                if result.get("message"):
                    messagebox.showinfo("Account created",
                                       "Check your email for a verification code.")
                    window.destroy()
                    self.temp_email = email
                    self.show_email_verification_form(username, email)
                else:
                    messagebox.showerror("Failed", result.get("message", "Registration failed."))
            else:
                detail = r.json().get("detail", "Registration failed.")
                if "already exists" in detail.lower() or "already taken" in detail.lower():
                    messagebox.showwarning("Already registered", detail)
                else:
                    messagebox.showerror("Failed", detail)
        except requests.exceptions.ConnectionError:
            messagebox.showerror("Connection error",
                                 "Could not reach the server. Try again later.")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def verify_email(self, code, window):
        if not code:
            messagebox.showerror("Error", "Enter the verification code.")
            return
        url = (f"{self.backend_url}/verify_email"
               f"?email={self.temp_email}&verification_token={code}")
        try:
            r = requests.post(url)
            if r.status_code == 200:
                messagebox.showinfo("Verified", "Email verified. You can now log in.")
                window.destroy()
                self.switch_page("archive")
            else:
                messagebox.showerror("Failed", "Invalid or expired code.")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def resend_verification_code(self, email):
        messagebox.showinfo("Sent", f"Verification code resent to {email}.")

    def handle_forgot_password(self, username, otp, new_pass, confirm_pass, window):
        if not all([username, otp, new_pass, confirm_pass]):
            messagebox.showerror("Error", "Fill all fields.")
            return
        try:
            r = requests.patch(f"{self.backend_url}/forgot_password",
                               params={"username": username,
                                       "entered_verify_code": otp,
                                       "new_password": new_pass,
                                       "new_password_confirm": confirm_pass},
                               timeout=10)
            if r.status_code == 200:
                messagebox.showinfo("Done", "Password reset successfully.")
                window.destroy()
            else:
                messagebox.showerror("Error", r.json().get("detail", "Reset failed."))
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def logout(self):
        self.is_logged_in = False
        self.current_user = None
        self.auth_token = None
        messagebox.showinfo("Logged out", "You have been logged out.")
        self.switch_page("archive")

    def delete_account(self, password, window):
        if not password:
            messagebox.showerror("Error", "Enter your password.")
            return
        if not self.is_logged_in or not self.auth_token:
            messagebox.showerror("Error", "You must be logged in.")
            window.destroy()
            return
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}",
                       "Content-Type": "application/json"}
            r = requests.delete(f"{self.backend_url}/delete_account",
                                json={"password": password},
                                headers=headers, timeout=10)
            if r.status_code == 200:
                window.destroy()
                messagebox.showinfo("Deleted",
                                    "Your account has been permanently deleted.")
                self.is_logged_in = False
                self.current_user = None
                self.auth_token = None
                self.switch_page("archive")
            elif r.status_code == 401:
                messagebox.showerror("Wrong password",
                                     "The password you entered is incorrect.")
            else:
                detail = r.json().get("detail", "Failed.")
                messagebox.showerror("Error", detail)
        except requests.exceptions.ConnectionError:
            messagebox.showerror("Connection error", "Could not reach the server.")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    # ─── google oauth ─────────────────────────────────────────────────────────

    def google_login(self):
        port = self._find_free_port()
        self._oauth_raw_params = None
        self._start_oauth_server(port)
        webbrowser.open(f"{self.backend_url}/auth/google/login?desktop_port={port}")
        self._show_google_waiting_dialog(port)

    def google_signup(self):
        self.google_login()

    def _find_free_port(self):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('', 0))
            return s.getsockname()[1]

    def _start_oauth_server(self, port):
        app_ref = self

        class Handler(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                parsed = urlparse(self.path)
                params = parse_qs(parsed.query)
                app_ref._oauth_raw_params = {k: v[0] for k, v in params.items()}

                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(
                    b'<!DOCTYPE html><html><head><meta charset="utf-8">'
                    b'<style>*{margin:0;padding:0;box-sizing:border-box}'
                    b'body{font-family:Georgia,serif;background:#1a1410;color:#f0e8d8;'
                    b'display:flex;align-items:center;justify-content:center;height:100vh}'
                    b'.card{text-align:center;padding:40px}'
                    b'h2{font-style:italic;font-weight:400;font-size:24px;margin-bottom:12px}'
                    b'p{color:#8a7e6a;font-family:monospace;font-size:13px}</style></head>'
                    b'<body><div class="card"><h2>Signed in.</h2>'
                    b'<p>You can close this window and return to Tendr.</p></div>'
                    b'<script>setTimeout(()=>window.close(),1500)</script>'
                    b'</body></html>'
                )
                threading.Thread(target=self.server.shutdown, daemon=True).start()

            def log_message(self, *args):
                pass

        self._oauth_server = socketserver.TCPServer(('localhost', port), Handler)
        self._oauth_server.allow_reuse_address = True
        t = threading.Thread(target=self._oauth_server.serve_forever, daemon=True)
        t.start()

    def _show_google_waiting_dialog(self, port):
        win = tk.Toplevel(self.root)
        win.title("Google Sign In")
        win.geometry("400x230")
        win.configure(bg=self.C['bg'])
        win.resizable(False, False)
        win.transient(self.root)
        win.grab_set()

        win.update_idletasks()
        x = self.root.winfo_x() + (self.root.winfo_width() - 400) // 2
        y = self.root.winfo_y() + (self.root.winfo_height() - 230) // 2
        win.geometry(f"400x230+{x}+{y}")

        frame = tk.Frame(win, bg=self.C['surface'],
                         highlightthickness=1, highlightbackground=self.C['rule'])
        frame.pack(fill='both', expand=True, padx=20, pady=20)

        tk.Label(frame, text="Continue in your browser",
                 font=(*self.FONT_SERIF, 15, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(pady=(24, 8))

        self._google_status = tk.Label(frame,
                 text="Waiting for Google sign-in...",
                 font=(*self.FONT_MONO, 9),
                 fg=self.C['muted'], bg=self.C['surface'])
        self._google_status.pack(pady=6)

        def cancel():
            if self._oauth_server:
                threading.Thread(target=self._oauth_server.shutdown, daemon=True).start()
                self._oauth_server = None
            self._oauth_raw_params = None
            win.destroy()

        self._ghost_btn(frame, "Cancel", cancel).pack(pady=10)

        self._poll_oauth_result(win)

    def _poll_oauth_result(self, win):
        if not win.winfo_exists():
            return
        if self._oauth_raw_params is not None:
            params = self._oauth_raw_params
            self._oauth_raw_params = None
            win.destroy()
            self._handle_google_oauth_result(params)
            return
        self.root.after(400, lambda: self._poll_oauth_result(win))

    def _handle_google_oauth_result(self, params):
        token     = params.get('token')
        username  = params.get('username')
        email     = params.get('email')
        pending   = params.get('pending_token')

        if token and username and email:
            self.auth_token        = token
            self.current_username  = unquote(username)
            self.current_email     = unquote(email)
            self.is_logged_in      = True
            self.user_data['xp']   = self.fetch_user_xp_from_backend()
            self.save_user_data()
            self.update_sidebar_stats()
            messagebox.showinfo("Welcome", f"Signed in as {self.current_username}.")
            self.switch_page("archive")
        elif pending:
            email_decoded = unquote(email or '')
            self._show_google_choose_username(pending, email_decoded)
        else:
            messagebox.showerror("Sign-in failed",
                                 "Google sign-in did not complete. Try again.")

    def _show_google_choose_username(self, pending_token, email):
        win, frame = self._dialog_base("Choose username", 420, 310)

        tk.Label(frame, text="One last step",
                 font=(*self.FONT_SERIF, 16, 'italic'),
                 fg=self.C['ink'], bg=self.C['surface']).pack(pady=(22, 6))

        tk.Label(frame, text=f"Creating account for  {email}",
                 font=(*self.FONT_MONO, 9),
                 fg=self.C['muted'], bg=self.C['surface']).pack(pady=(0, 12))

        tk.Frame(frame, bg=self.C['rule'], height=1).pack(fill='x', padx=16, pady=(0, 14))

        tk.Label(frame, text="CHOOSE A USERNAME",
                 font=(*self.FONT_MONO, 8),
                 fg=self.C['muted'], bg=self.C['surface']).pack()

        uname_entry = self._input(frame, width=28)
        uname_entry.pack(pady=(4, 16), ipady=5)

        def create():
            uname = uname_entry.get().strip()
            if len(uname) < 3:
                messagebox.showerror("Error", "Username must be at least 3 characters.")
                return
            try:
                r = requests.post(
                    f"{self.backend_url}/auth/google/complete-registration",
                    json={"pending_token": pending_token, "username": uname},
                    timeout=10,
                )
                if r.ok:
                    data = r.json()
                    self.auth_token       = data.get("token") or data.get("access_token")
                    self.current_username = data.get("username")
                    self.current_email    = data.get("email")
                    self.is_logged_in     = True
                    self.user_data['xp']  = self.fetch_user_xp_from_backend()
                    self.save_user_data()
                    self.update_sidebar_stats()
                    win.destroy()
                    messagebox.showinfo("Welcome", f"Account created. Welcome, {uname}!")
                    self.switch_page("archive")
                else:
                    detail = r.json().get("detail", "Registration failed.")
                    messagebox.showerror("Error", detail)
            except Exception as e:
                messagebox.showerror("Error", str(e))

        self._primary_btn(frame, "Create account", create).pack()
        uname_entry.focus()
        win.bind('<Return>', lambda e: create())

    # ─── backend API helpers ──────────────────────────────────────────────────

    def fetch_tasks_from_backend(self):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            r = requests.get(f"{self.backend_url}/tasks", headers=h)
            return r.json() if r.status_code == 200 else []
        except Exception as e:
            print(f"fetch tasks: {e}")
            return []

    def fetch_user_xp_from_backend(self):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            r = requests.get(f"{self.backend_url}/user/xp", headers=h)
            return r.json().get('xp', 0) if r.status_code == 200 else 0
        except Exception as e:
            print(f"fetch xp: {e}")
            return 0

    def fetch_stats_from_backend(self, user_id):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            r = requests.get(f"{self.backend_url}/analysis/{user_id}", headers=h)
            return r.json() if r.status_code == 200 else {}
        except Exception as e:
            print(f"fetch stats: {e}")
            return {}

    def fetch_focus_total_from_backend(self):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            r = requests.get(f"{self.backend_url}/focus/total", headers=h)
            return r.json() if r.status_code == 200 else {}
        except Exception as e:
            print(f"fetch focus total: {e}")
            return {}

    def add_task_to_backend(self, title, priority, category=None):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}",
                 "Content-Type": "application/json"} if self.auth_token else {}
            body = {"title": title, "priority": priority}
            if category:
                body["category"] = category
            r = requests.post(f"{self.backend_url}/tasks", json=body, headers=h)
            return r.json() if r.status_code == 200 else None
        except Exception as e:
            print(f"add task: {e}")
            return None

    def update_task_completed_backend(self, task_id, completed):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}",
                 "Content-Type": "application/json"} if self.auth_token else {}
            r = requests.patch(f"{self.backend_url}/tasks/{task_id}",
                               json={"completed": completed}, headers=h)
            return r.json() if r.status_code == 200 else None
        except Exception as e:
            print(f"update task: {e}")
            return None

    def delete_task_from_backend(self, task_id):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            r = requests.delete(f"{self.backend_url}/tasks/{task_id}", headers=h)
            return r.status_code == 200
        except Exception as e:
            print(f"delete task: {e}")
            return False

    def fetch_pets_from_backend(self):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            r = requests.get(f"{self.backend_url}/pet", headers=h)
            return r.json() if r.status_code == 200 else []
        except Exception as e:
            print(f"fetch pets: {e}")
            return []

    def create_pet_in_backend(self, name, pet_type, age=0, hunger=100):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}",
                 "Content-Type": "application/json"} if self.auth_token else {}
            r = requests.post(f"{self.backend_url}/pets",
                              json={"name": name, "type": pet_type,
                                    "age": age, "hunger": hunger},
                              headers=h)
            return r.json() if r.status_code == 200 else None
        except Exception as e:
            print(f"create pet: {e}")
            return None

    def feed_pet_in_backend(self, pet_id):
        try:
            h = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            r = requests.patch(f"{self.backend_url}/pet/feed/{pet_id}", headers=h)
            return r.json() if r.status_code == 200 else None
        except Exception as e:
            print(f"feed pet: {e}")
            return None

    def reset_password_backend(self, username, otp, new_pass, new_pass2, window):
        if not all([otp, new_pass, new_pass2]):
            messagebox.showerror("Error", "Fill all fields.")
            return
        try:
            r = requests.patch(f"{self.backend_url}/forgot_password",
                               params={"username": username,
                                       "entered_verify_code": otp,
                                       "new_password": new_pass,
                                       "new_password_confirm": new_pass2},
                               timeout=10)
            if r.status_code == 200:
                messagebox.showinfo("Done", "Password reset successfully.")
                window.destroy()
            else:
                messagebox.showerror("Error",
                                     r.json().get("detail", "Reset failed."))
        except Exception as e:
            messagebox.showerror("Error", str(e))

    # ─── run ──────────────────────────────────────────────────────────────────

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    try:
        import tkinter.simpledialog
        import tkinter.filedialog
    except ImportError:
        pass

    app = TendrApp()
    app.run()
