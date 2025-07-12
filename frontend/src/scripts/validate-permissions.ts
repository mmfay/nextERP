import fs from "fs";
import path from "path";

// 1. Load frontend permissions (assuming it's in src/app/config/permissions.ts)
const permissionsFile = path.join(__dirname, "../app/config/permissions.ts");
const contents = fs.readFileSync(permissionsFile, "utf8");

// Extract permission keys using regex (based on a `Permissions = { ... }` object)
const match = contents.match(/Permissions\s*=\s*{([\s\S]*?)}/);
if (!match) {
  console.error("❌ Could not find Permissions object in permissions.ts");
  process.exit(1);
}

const lines = match[1]
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && line.includes(":"))
  .map((line) => line.split(":")[1].trim().replace(/['",]/g, ""));

const frontendPermissions = new Set(lines);

// 2. Load backend permissions (from local file or endpoint)
const backendPermissionsFile = path.join(__dirname, "../../../backend/scripts/backend-permissions.json");

if (!fs.existsSync(backendPermissionsFile)) {
  console.error("❌ backend-permissions.json not found. Please sync it manually for now.");
  process.exit(1);
}

const backendPermissions = new Set(
  JSON.parse(fs.readFileSync(backendPermissionsFile, "utf8"))
);

// 3. Compare
const missing = Array.from(frontendPermissions).filter(
  (perm) => !backendPermissions.has(perm)
);

if (missing.length > 0) {
  console.error("❌ Missing backend permissions for:");
  missing.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log("✅ All frontend permissions are registered in backend.");
