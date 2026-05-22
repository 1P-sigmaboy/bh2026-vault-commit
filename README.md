# 🔐 The Vault Commit — Black Hat USA 2026
### A 1Password Developer Challenge

> **Complete this challenge to win instant swag and a Grand Prize raffle ticket.**  
> Return each day of the conference to earn an additional ticket. Max 3 tickets total.

---

## What You're Doing

You've been given a script with a **hardcoded GitHub token** — a classic developer security mistake.  
Your mission: vault the token in 1Password, replace the plaintext secret with a secret reference, and push a commit using `op run`. Zero plaintext secrets. Zero excuses.

---

## Prerequisites

Make sure you have the following installed before you start:

| Tool | Install |
|---|---|
| **Node.js** (v18+) | https://nodejs.org |
| **1Password Desktop App** | https://1password.com/downloads |
| **1Password CLI (`op`)** | https://developer.1password.com/docs/cli/get-started |

Verify your CLI is ready:

```bash
op --version
```

If this is your first time using the CLI, sign in:

```bash
op signin
```

---

## Your Challenge Credentials

These are printed on your card. You'll need them in the steps below.

| Field | Value |
|---|---|
| **GitHub Token** | *(on your card — do not share)* |
| **Repo** | `github.com/1p-sigmaboy/bh2026-vault-commit` |
| **Vault Name** | `Private` |

---

## Step-by-Step Instructions

### Step 1 — Store the token in 1Password

Open 1Password and create a new item in the **`Private`** vault:

1. Click **New Item → Login**
2. Set the **Title** to `GitHub-PAT`
3. Paste your GitHub token from the card into the **Password** field
4. Save the item

Verify it's stored correctly:

```bash
op item get "GitHub-PAT" --vault "Private"
```

---

### Step 2 — Find your secret reference

Run the following to confirm the exact reference URI for your token:

```bash
op read "op://Private/GitHub-PAT/token"
```

If your token value is printed back — your reference is valid. ✅

Your secret reference is:

```
op://Private/GitHub-PAT/token
```

---

### Step 3 — Update the script

Open `commit.js`. Find this line near the top:

```javascript
// ❌ HARDCODED — your job is to fix this
const GITHUB_TOKEN = "ghp_XXXXXXXXXXXXXXXXXXXX";
```

Replace it so the token is read from the environment:

```javascript
// ✅ FIXED — injected at runtime by op run
const GITHUB_TOKEN = process.env.BH_GITHUB_TOKEN;
```

Save the file.

---

### Step 4 — Run the script with `op run`

Use `op run` to inject your secret reference at runtime. Replace `@YourHandle` with your name or GitHub username:

```bash
BH_GITHUB_TOKEN="op://Private/GitHub-PAT/token" \
  op run -- node commit.js @YourHandle
```

A successful run prints:

```
✅ Commit successful! SHA: abc123...
👉 Show this to booth staff to claim your swag.
```

---

### Step 5 — Claim your prize

Bring your terminal (or a screenshot of the success output) to the **1Password booth**.  
Staff will verify your commit on the repo and hand you:

- 🧦 **1Password socks** — yours to keep immediately
- 🎟️ **Raffle ticket** — for the Grand Prize drawing on the final day of the conference

> **Grand Prize drawing is in-person at the booth. You must be present to win.**

---

## Coming Back Tomorrow?

Return on Day 2 and Day 3 to run the challenge again with the same or a new card.  
Each day you complete it earns you **one additional raffle ticket** — up to **3 tickets total** across the conference.

---

## Troubleshooting

**`op: command not found`**  
The 1Password CLI isn't installed or isn't in your PATH.  
→ Install it from https://developer.1password.com/docs/cli/get-started and follow the PATH setup instructions.

**`[ERROR] 401 Unauthorized`**  
Your token may be incorrect or the wrong field was referenced.  
→ Run `op read "op://BH2026-Challenge/GitHub-PAT/password"` and confirm the value matches your card.

**`op read` returns nothing / empty**  
The item name or field name doesn't match.  
→ Run `op item get "GitHub-PAT" --vault "BH2026-Challenge"` to see all field labels and correct the reference.

**`[ERROR] 403 Forbidden`**  
Your token doesn't have write access to the repo.  
→ Visit the booth and ask staff for a replacement card with a fresh token.

**Biometric prompt isn't appearing**  
1Password CLI needs to be linked to the Desktop App.  
→ Open 1Password → Settings → Developer → enable **"Integrate with 1Password CLI"**

---

## How It Works Under the Hood

When you run `op run`, 1Password:

1. Scans the environment for any values matching the `op://` URI format
2. Resolves each reference by fetching the secret from your local vault
3. Injects the plaintext value into the process environment **in memory only**
4. Launches the process — in this case, `node commit.js`
5. The secret is **never written to disk**, never stored in shell history, and destroyed when the process exits

This is the same pattern used in production CI/CD pipelines and developer workflows to eliminate plaintext secrets from codebases entirely.

---

## Learn More

| Resource | Link |
|---|---|
| 1Password Developer Docs | https://developer.1password.com |
| CLI Reference | https://developer.1password.com/docs/cli |
| Secret References | https://developer.1password.com/docs/cli/secret-references |
| Free Trial | https://1password.com/try |

---

*Built with 1Password Developer Tools · Black Hat USA 2026*
