# 🔐 The Vault Commit — Black Hat USA 2026
### A 1Password Developer Challenge

> **Complete this challenge to win instant swag and a Grand Prize raffle ticket.**  
> Return each day of the conference to earn an additional ticket. Max 3 tickets total.

---

## Your Challenge Mission

You've been given a script with a **hardcoded GitHub Access Token** — a classic developer security mistake.  
Your mission: store the token in a **1Password Environment**, update the script to read it with the **1Password JS SDK**, and push a commit. Zero plaintext secrets. Zero excuses.

---

## Prerequisites

Make sure you have the following installed before you start:

| Tool | Install |
|---|---|
| **Node.js** (v18+) | https://nodejs.org |
| **1Password Desktop App** | https://1password.com/downloads |

---

## Step-by-Step Instructions

### Step 1 — Set up 1Password

1. Install the [1Password desktop app](https://1password.com/downloads).
2. Open **Settings → Developer**.
3. Turn on **Show 1Password Developer experience**.

This unlocks **Developer → View Environments** in the sidebar.

---

### Step 2 — Create your GitHub Personal Access Token

1. Go to [github.com](https://github.com) → **Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens**.
2. Create a token scoped to the repo: `bh2026-vault-commit`.
3. Set **Contents** to **Read and Write**.
4. Copy the token — you'll need it in the next step.

> **Repo:** `github.com/1P-sigmaboy/bh2026-vault-commit`

---

### Step 3 — Create a 1Password Environment

1. In the 1Password desktop app, go to **Developer → View Environments → New Environment**.
2. Name it `BH2026-Challenge`.
3. Add a variable:
   - **Name:** `BH_GITHUB_TOKEN`
   - **Value:** your GitHub PAT from Step 2

---

### Step 4 — Copy your Environment ID

1. Open the `BH2026-Challenge` environment.
2. Select **Manage Environment → Copy environment ID**.
3. Keep this ID handy — you'll pass it to the script at runtime.

---

### Step 5 — Clone the repo and run `commit.js`

```bash
git clone https://github.com/1P-sigmaboy/bh2026-vault-commit.git
cd bh2026-vault-commit
npm install
```

Set your 1Password account name (shown at the top-left of the desktop app sidebar), then run the script:

```bash
export OP_ACCOUNT_NAME="Your Account Name"
node commit.js @YourHandle <EnvironmentID>
```

The script uses the 1Password JS SDK to authenticate via the desktop app (biometrics) and reads `BH_GITHUB_TOKEN` directly from your Environment.

A successful run prints:

```
✅ Commit successful!
   SHA: abc123...
   Handle: @YourHandle

👉 Show this output to booth staff to claim your swag.
```

---

### Step 6 — Show your commit SHA at the booth

Bring your terminal (or a screenshot of the success output) to the **1Password booth**.  
Staff will verify your commit on the repo and hand you:

- 🧦 **1Password socks** — yours to keep immediately
- 🎟️ **Raffle ticket** — for the Grand Prize drawing on the final day of the conference

> **Grand Prize drawing is in-person at the booth. You must be present to win.**

---

## Coming Back Tomorrow?

Return on Day 2 and Day 3 to run the challenge again.  
Each day you complete it earns you **one additional raffle ticket** — up to **3 tickets total** across the conference.

---

## What Changed vs. the Old Approach

| | Before (`op run`) | Now (Environments + SDK) |
|---|---|---|
| **Secret storage** | 1Password vault item | 1Password Environment variable |
| **Injection method** | `op run` shell wrapper | JS SDK `getVariables()` call |
| **Auth** | CLI session | Desktop app biometrics |
| **Dependencies** | 1Password CLI installed | `@1password/sdk` npm package |
| **Runtime config** | `op://` secret reference in env | Environment ID as argument |
| **Plaintext risk** | None | None |

---

## Troubleshooting

**`❌ Usage: node commit.js @YourHandle <EnvironmentID>`**  
You forgot your handle or Environment ID.  
→ Run: `node commit.js @YourHandle <EnvironmentID>`

**`❌ Set OP_ACCOUNT_NAME to your 1Password account name`**  
The SDK needs your account name to authenticate with the desktop app.  
→ Set `OP_ACCOUNT_NAME` to the name shown at the top-left of the 1Password desktop app sidebar.

**`❌ BH_GITHUB_TOKEN not found in the specified Environment`**  
The variable name or Environment ID doesn't match.  
→ Confirm the variable is named exactly `BH_GITHUB_TOKEN` in your `BH2026-Challenge` environment.  
→ Re-copy the Environment ID from **Manage Environment → Copy environment ID**.

**`❌ Could not read repo ref. Check your token permissions.`**  
Your token doesn't have write access to the repo or has expired.  
→ Create a new fine-grained PAT scoped to `bh2026-vault-commit` with **Contents: Read and Write**.

**Biometric prompt isn't appearing**  
The 1Password desktop app must be unlocked and the Developer experience must be enabled.  
→ Open 1Password → **Settings → Developer** → enable **Show 1Password Developer experience**.

**`npm install` fails on `@1password/sdk`**  
You need Node.js v18 or later.  
→ Run `node --version` and upgrade from https://nodejs.org if needed.

---

## How It Works Under the Hood

When you run `commit.js`, the 1Password JS SDK:

1. Authenticates with the 1Password desktop app (biometrics or account password)
2. Calls `getVariables()` to fetch secrets from your Environment by ID
3. Reads `BH_GITHUB_TOKEN` in memory — never from disk or shell history
4. Uses the token to create and push a Git commit via the GitHub API
5. Destroys the secret when the process exits

This is the same pattern used in production applications to eliminate plaintext secrets from codebases entirely.

---

## Learn More

| Resource | Link |
|---|---|
| 1Password Developer Docs | https://developer.1password.com |
| Read Environments with SDKs | https://www.1password.dev/environments/read-environment-variables |
| 1Password Environments | https://www.1password.dev/environments/overview |
| 1Password SDKs | https://www.1password.dev/sdks/overview |
| Free Trial | https://1password.com/try |

---

*Built with 1Password Developer Tools · Black Hat USA 2026*
