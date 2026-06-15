// commit.js — 1Password Developer Challenge · Black Hat USA 2026
// Uses the 1Password JS SDK to read BH_GITHUB_TOKEN from a 1Password Environment.
// No plaintext secrets. No op run. No .env files.

import { createClient, DesktopAuth } from "@1password/sdk";

const REPO_OWNER = "1P-sigmaboy";
const REPO_NAME = "bh2026-vault-commit";
const YOUR_HANDLE = process.argv[2] || "anonymous";
const ENVIRONMENT_ID = process.argv[3];

const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

async function run() {
  if (!YOUR_HANDLE || YOUR_HANDLE === "anonymous") {
    console.error("❌ Usage: node commit.js @YourHandle <EnvironmentID>");
    process.exit(1);
  }
  if (!ENVIRONMENT_ID) {
    console.error(
      "❌ Environment ID required. Get it from: 1Password Desktop → Developer → View Environments → Manage Environment → Copy environment ID"
    );
    process.exit(1);
  }

  const accountName = process.env.OP_ACCOUNT_NAME;
  if (!accountName) {
    console.error(
      "❌ Set OP_ACCOUNT_NAME to your 1Password account name (top-left sidebar in the desktop app)."
    );
    process.exit(1);
  }

  // Step 1 — Authenticate via 1Password desktop app (biometrics / account password)
  console.log("🔐 Authenticating with 1Password...");
  const client = await createClient({
    auth: new DesktopAuth(accountName),
    integrationName: "BH2026 Vault Commit Challenge",
    integrationVersion: "1.0.0",
  });

  // Step 2 — Fetch environment variables from the 1Password Environment
  console.log("🔑 Reading BH_GITHUB_TOKEN from 1Password Environment...");
  const envResponse = await client.environments.getVariables(ENVIRONMENT_ID);
  const githubToken = envResponse.variables.find(
    (v) => v.name === "BH_GITHUB_TOKEN"
  )?.value;

  if (!githubToken) {
    console.error("❌ BH_GITHUB_TOKEN not found in the specified Environment.");
    console.error("   Make sure the variable name is exactly: BH_GITHUB_TOKEN");
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Step 3 — Get the HEAD commit SHA from the ref
  const refRes = await fetch(`${BASE_URL}/git/refs/heads/main`, { headers });
  const refData = await refRes.json();
  const headCommitSha = refData.object?.sha;

  if (!headCommitSha) {
    console.error("❌ Could not read repo ref. Check your token permissions.");
    process.exit(1);
  }

  // Step 4 — Get the tree SHA from the HEAD commit
  const commitRes = await fetch(`${BASE_URL}/git/commits/${headCommitSha}`, {
    headers,
  });
  const commitData = await commitRes.json();
  const treeSha = commitData.tree?.sha;

  if (!treeSha) {
    console.error("❌ Could not resolve tree SHA from commit.");
    process.exit(1);
  }

  // Step 5 — Create a new commit using the correct tree SHA
  const newCommitRes = await fetch(`${BASE_URL}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: `BH2026 vault commit by @${YOUR_HANDLE.replace(/^@/, "")}`,
      tree: treeSha,
      parents: [headCommitSha],
    }),
  });
  const newCommit = await newCommitRes.json();

  if (!newCommit.sha) {
    console.error(
      "❌ Something went wrong creating commit:",
      newCommit.message
    );
    process.exit(1);
  }

  // Step 6 — Update the branch ref to point to the new commit
  const updateRes = await fetch(`${BASE_URL}/git/refs/heads/main`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });
  const updatedRef = await updateRes.json();

  if (updatedRef.object?.sha) {
    console.log(`\n✅ Commit successful!`);
    console.log(`   SHA: ${newCommit.sha}`);
    console.log(`   Handle: @${YOUR_HANDLE.replace(/^@/, "")}`);
    console.log(`\n👉 Show this output to booth staff to claim your swag.\n`);
  } else {
    console.error("❌ Commit created but ref update failed:", updatedRef.message);
  }
}

run().catch((err) => {
  console.error("❌ Unexpected error:", err.message);
  process.exit(1);
});
