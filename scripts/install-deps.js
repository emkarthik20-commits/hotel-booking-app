import { execSync } from "child_process";

console.log("Removing existing lockfile...");
try {
  execSync("rm -f /vercel/share/v0-project/pnpm-lock.yaml", { stdio: "inherit" });
} catch (e) {
  console.log("No lockfile to remove");
}

console.log("Running pnpm install to regenerate lockfile...");
execSync("cd /vercel/share/v0-project && pnpm install --no-frozen-lockfile", {
  stdio: "inherit",
});

console.log("Done! Lockfile regenerated.");
