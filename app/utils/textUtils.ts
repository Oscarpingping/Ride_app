export const getInitials = (name?: string): string => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return '?';
  }
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  } else if (words.length === 1 && words[0].length > 0) {
    return words[0].length >= 2 ? words[0].substring(0, 2).toUpperCase() : words[0].toUpperCase();
  }
  return '?';
}; 