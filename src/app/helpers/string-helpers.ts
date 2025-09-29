export const truncateTooltipText = (text: string, limit = 1500): string => {
  if (!text) {
    return text;
  }

  if (text.length > limit) {
    return `${text.slice(0, limit)} ...more`;
  }

  return text;
};
