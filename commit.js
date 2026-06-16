// commit.js — 1Password Developer Challenge · Black Hat USA 2026
// ❌ HARDCODED — your job is to fix this by reading from a 1Password Environment via the JS SDK.
//
// Commits are pushed to the `bh` branch only — `main` is locked to repo admins.

import { createClient, DesktopAuth } from "@1password/sdk";

const REPO_OWNER = "1P-sigmaboy";
const REPO_NAME = "bh2026-vault-commit";
const TARGET_BRANCH = "bh";
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

async function getJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  return { res, data };
}

async function getBranchHeadSha() {
  const { res, data } = await getJson(
    `${BASE_URL}/git/refs/heads/${TARGET_BRANCH}`,
    { headers }
  );

  if (res.ok) {
    return data.object?.sha;
  }

  if (res.status === 404) {
    console.error(
      `❌ Branch "${TARGET_BRANCH}" does not exist yet. Ask booth staff — an admin must create it from main before the challenge starts.`
    );
    process.exit(1);
  }

  if (res.status === 403) {
    console.error(
      `❌ Token cannot read branch "${TARGET_BRANCH}". Check that your PAT is scoped to this branch.`
    );
    process.exit(1);
  }

  console.error("❌ Could not read branch ref:", data.message);
  process.exit(1);
}

async function run() {
  if (!YOUR_HANDLE || YOUR_HANDLE === "anonymous") {
    console.error("❌ Usage: node commit.js @YourHandle");
    process.exit(1);
  }

  if (!BH_GITHUB_TOKEN || BH_GITHUB_TOKEN === "ghp_XXXXXXXXXXXXXXXXXXXX") {
    console.error("❌ Replace the hardcoded token with your GitHub PAT from your challenge card.");
    process.exit(1);
  }

  const headCommitSha = await getBranchHeadSha();

  // Step 1 — Get the tree SHA from the branch HEAD commit
  const { data: commitData } = await getJson(
    `${BASE_URL}/git/commits/${headCommitSha}`,
    { headers }
  );
  const treeSha = commitData.tree?.sha;

  if (!treeSha) {
    console.error("❌ Could not resolve tree SHA from commit.");
    process.exit(1);
  }

  // Step 2 — Create a new commit on top of the branch HEAD
  const { res: newCommitRes, data: newCommit } = await getJson(
    `${BASE_URL}/git/commits`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: `BH2026 vault commit by @${YOUR_HANDLE.replace(/^@/, "")}`,
        tree: treeSha,
        parents: [headCommitSha],
      }),
    }
  );

  if (!newCommit.sha) {
    console.error(
      "❌ Something went wrong creating commit:",
      newCommit.message
    );
    process.exit(1);
  }

  // Step 3 — Update the branch ref (bh only — main is protected)
  const { res: updateRes, data: updatedRef } = await getJson(
    `${BASE_URL}/git/refs/heads/${TARGET_BRANCH}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    }
  );

  if (updateRes.status === 403) {
    console.error(
      `❌ Cannot update "${TARGET_BRANCH}". Your token may be scoped to the wrong branch, or you may be targeting main by mistake.`
    );
    process.exit(1);
  }

  if (updatedRef.object?.sha) {
    console.log(`\n✅ Commit successful!`);
    console.log(`   SHA: ${newCommit.sha}`);
    console.log(`   Branch: ${TARGET_BRANCH}`);
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
