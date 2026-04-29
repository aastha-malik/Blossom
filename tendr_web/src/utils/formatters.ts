import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

export const formatTimeAgo = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

