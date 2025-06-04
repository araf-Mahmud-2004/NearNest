import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    
    // If it's today, show relative time
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // If it's yesterday, show "yesterday"
    if (isYesterday(date)) {
      return 'yesterday';
    }
    
    // If it's within the last week, show day name
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return format(date, 'EEEE'); // Monday, Tuesday, etc.
    }
    
    // If it's within the current year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d'); // Jan 15
    }
    
    // Otherwise show full date
    return format(date, 'MMM d, yyyy'); // Jan 15, 2023
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'unknown';
  }
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'unknown time ago';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'unknown date';
  }
};