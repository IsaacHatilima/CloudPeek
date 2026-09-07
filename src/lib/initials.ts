/**
 * Initials for an avatar fallback: the first letter of the first two words
 * ("landeni-website" → "LW"), one letter for a single word, "?" for nothing.
 * Words are split on anything that is not a letter or a digit.
 */
export function initialsFor(name: string): string {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter((word) => word !== "");
  if (words.length === 0) return "?";
  const letters = words.slice(0, 2).map((word) => word.charAt(0));
  return (words.length === 1 ? letters[0] : letters.join("")).toUpperCase();
}
