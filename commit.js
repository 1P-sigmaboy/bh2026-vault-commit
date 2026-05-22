// commit.js — 1Password Developer Challenge · Black Hat 2026
const { execSync } = require("child_process");

// ❌ HARDCODED — your job is to fix this
const GITHUB_TOKEN = "ghp_BH26K9mN2vP4qR7sT1uW3yAc8dE0fGJ5";
const REPO = "https://github.com/1password/bh2026-vault-commit";
const YOUR_HANDLE = process.argv[2] || "anonymous";

async function run() {
  const response = await fetch("https://api.github.com/repos/1password/bh2026-vault-commit/git/refs/heads/main");
  const { object } = await response.json();

  await fetch("https://api.github.com/repos/1password/bh2026-vault-commit/git/commits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `BH2026 vault commit by @${YOUR_HANDLE}`,
      tree: object.sha,
      parents: [object.sha],
    }),
  }).then(r => r.json()).then(data => {
    if (data.sha) {
      console.log(`✅ Commit successful! SHA: ${data.sha}`);
      console.log(`👉 Show this to booth staff to claim your swag.`);
    } else {
      console.error("❌ Something went wrong:", data.message);
    }
  });
}

run();
