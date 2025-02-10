export const sanitizeInput = (input) => {
  if (typeof input !== "string") return null;

  let sanitized = input.replace(/<[^>]+>/g, ""); // Usunięcie tagów HTML

  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  sanitized = sanitized.substring(0, 1000); // Maks. 1000 znaków

  return sanitized.trim() || null; // Jeśli po sanitizacji nie ma nic, zwróć `null`
};
