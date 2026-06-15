// commit.js — 1Password Developer Challenge · Black Hat USA 2026
// ❌ HARDCODED — your job is to fix this by reading from a 1Password Environment via the JS SDK.

import { createClient, DesktopAuth } from "@1password/sdk";

const REPO_OWNER = "1P-sigmaboy";
const REPO_NAME = "bh2026-vault-commit";
const YOUR_HANDLE = process.argv[2] || "anonymous";

// ❌ HARDCODED — replace with your GitHub PAT from your challenge card
const BH_GITHUB_TOKEN = "ghp_XXXXXXXXXXXXXXXXXXXX";
// ✅ FIXED — read from your 1Password Environment (see README for SDK setup)
// const BH_GITHUB_TOKEN = (await client.environments.getVariables(process.argv[3])).variables.find((v) => v.name === "BH_GITHUB_TOKEN")?.value;

const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

const headers = {
  Authorization: `Bearer ${BH_GITHUB_TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function run() {
  if (!YOUR_HANDLE || YOUR_HANDLE === "anonymous") {
    console.error("❌ Usage: node commit.js @YourHandle");
    process.exit(1);
  }

  if (!BH_GITHUB_TOKEN || BH_GITHUB_TOKEN === "ghp_XXXXXXXXXXXXXXXXXXXX") {
    console.error("❌ Replace the hardcoded token with your GitHub PAT from your challenge card.");
    process.exit(1);
  }

  // Step 1 — Get the HEAD commit SHA from the ref
  const refRes = await fetch(`${BASE_URL}/git/refs/heads/main`, { headers });
  const refData = await refRes.json();
  const headCommitSha = refData.object?.sha;

  if (!headCommitSha) {
    console.error("❌ Could not read repo ref. Check your token permissions.");
    process.exit(1);
  }

  // Step 2 — Get the tree SHA from the HEAD commit
  const commitRes = await fetch(`${BASE_URL}/git/commits/${headCommitSha}`, {
    headers,
  });
  const commitData = await commitRes.json();
  const treeSha = commitData.tree?.sha;

  if (!treeSha) {
    console.error("❌ Could not resolve tree SHA from commit.");
    process.exit(1);
  }

  // Step 3 — Create a new commit using the correct tree SHA
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

  // Step 4 — Update the branch ref to point to the new commit
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
