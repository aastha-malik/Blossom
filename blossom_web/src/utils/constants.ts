export const API_URL = import.meta.env.VITE_API_URL

export const SESSION_LENGTHS = {
  SHORT: 25,
  MEDIUM: 45,
  LONG: 60,
} as const;

export const TASK_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

export const STATS_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL_TIME: 'all_time',
} as const;

