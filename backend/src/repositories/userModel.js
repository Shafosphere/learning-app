// Tymczasowa nakładka – pozwala starym importom działać userModel.js
export * from "./user.repo.js";
export { default } from "./user.repo.js"; // ← bezpiecznik, jeśli user.repo.js ma eksport domyślny
