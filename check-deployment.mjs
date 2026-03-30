#!/usr/bin/env node

/**
 * 🧪 PRE-DEPLOYMENT VALIDATION SCRIPT
 * Verifica se tudo está pronto para fazer deploy no Railway/Render
 * 
 * Uso: node check-deployment.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const checks = [];

function check(name, condition, details = "") {
  const status = condition ? "✅" : "❌";
  console.log(`${status} ${name}`);
  if (details && !condition) {
    console.log(`   └─ ${details}`);
  }
  checks.push({ name, condition });
}

console.log("\n🔍 PRE-DEPLOYMENT VALIDATION\n");
console.log("─".repeat(60) + "\n");

// ─── FILE EXISTENCE CHECKS ───────────────────────────────────────────
console.log("📁 Configuration Files:\n");

check(
  "Dockerfile exists",
  fs.existsSync(path.join(__dirname, "Dockerfile")),
  "Create: Dockerfile (in root)"
);

check(
  "railway.json exists",
  fs.existsSync(path.join(__dirname, "railway.json")),
  "Create: railway.json"
);

check(
  ".env.example exists",
  fs.existsSync(path.join(__dirname, ".env.example")),
  "Create: .env.example"
);

check(
  "pnpm-lock.yaml exists",
  fs.existsSync(path.join(__dirname, "pnpm-lock.yaml")),
  "Run: pnpm install --frozen-lockfile"
);

// ─── PACKAGE.JSON CHECKS ─────────────────────────────────────────────
console.log("\n📦 Package Configuration:\n");

try {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
  );
  check("Root package.json valid", true);

  const apiPkg = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "artifacts/api-server/package.json"),
      "utf-8"
    )
  );
  check(
    "Backend has build script",
    apiPkg.scripts && apiPkg.scripts.build,
    "Missing build script in api-server/package.json"
  );

  const frontendPkg = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "artifacts/conserje/package.json"),
      "utf-8"
    )
  );
  check(
    "Frontend has build script",
    frontendPkg.scripts && frontendPkg.scripts.build,
    "Missing build script in conserje/package.json"
  );
} catch (err) {
  check("Package.json readable", false, err.message);
}

// ─── APP.TS STATIC SERVING CHECK ─────────────────────────────────────
console.log("\n📡 Backend Configuration:\n");

try {
  const appTs = fs.readFileSync(
    path.join(__dirname, "artifacts/api-server/src/app.ts"),
    "utf-8"
  );
  check(
    "app.ts serves static files",
    appTs.includes("express.static"),
    "Update app.ts: Add express.static() middleware"
  );
  check(
    "app.ts has SPA fallback",
    appTs.includes("app.get(\"*\""),
    "Update app.ts: Add wildcard route for SPA"
  );
  check(
    "app.ts imports Express",
    appTs.includes("import express"),
    "app.ts missing imports"
  );
} catch (err) {
  check("app.ts accessible", false, err.message);
}

// ─── DATABASE SETUP CHECK ─────────────────────────────────────────────
console.log("\n💾 Database Configuration:\n");

check(
  ".env file exists (local)",
  fs.existsSync(path.join(__dirname, ".env")),
  "⚠️  No .env found locally - create from .env.example before local testing"
);

if (fs.existsSync(path.join(__dirname, ".env"))) {
  const env = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  check(
    "DATABASE_URL set in .env",
    env.includes("DATABASE_URL"),
    "Add DATABASE_URL to .env (use Supabase Pooler IPv4)"
  );
  check(
    "NODE_ENV configured",
    env.includes("NODE_ENV"),
    "Add NODE_ENV=production"
  );
}

// ─── GIT CHECKS ───────────────────────────────────────────────────────
console.log("\n🔗 Git Repository:\n");

check(
  ".git folder exists",
  fs.existsSync(path.join(__dirname, ".git")),
  "Initialize: git init && git remote add origin <url>"
);

check(
  ".gitignore configured",
  fs.existsSync(path.join(__dirname, ".gitignore")),
  "Create .gitignore (exclude node_modules, .env, etc)"
);

// ─── SUMMARY ──────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(60) + "\n");

const passed = checks.filter((c) => c.condition).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`📊 RESULT: ${passed}/${total} checks passed (${percentage}%)\n`);

if (percentage === 100) {
  console.log("✅ ALL CHECKS PASSED! Ready for deployment.\n");
  console.log("📝 Next steps:");
  console.log("   1. git add -A && git commit -m 'Deploy configuration'");
  console.log("   2. git push origin main");
  console.log("   3. Go to Railway.app/Render.com and connect your repo\n");
  process.exit(0);
} else {
  console.log(
    "⚠️  Some checks failed. Fix them before deploying.\n"
  );
  process.exit(1);
}
