import { execSync } from "child_process"

try {
  console.log("Removing old lockfile...")
  execSync("rm -f /vercel/share/v0-project/pnpm-lock.yaml", { stdio: "inherit" })
  console.log("Running pnpm install to regenerate lockfile...")
  execSync("cd /vercel/share/v0-project && pnpm install --no-frozen-lockfile", { stdio: "inherit" })
  console.log("Lockfile regenerated successfully!")
} catch (error) {
  console.error("Error:", error.message)
}
