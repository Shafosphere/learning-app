export default function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  let sanitized = input.replace(/<[^>]+>/g, "");

  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  sanitized = sanitized.substring(0, 1000);

  return sanitized.trim(); // Usunięcie nadmiarowych spacji
}
