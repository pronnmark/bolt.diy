# bolt.diy — purpose of this deployment

This checkout is **not a general bolt.diy fork**. It is a private, hosted bolt.diy that lets Philip's
collaborators open the **Résone** project (`pronnmark/resone`), prompt an AI to change it, and push
the result to GitHub with zero setup.

## What it must do
1. Collaborator opens https://bolt.hostbun.cc (Caddy basic-auth login, one account per person).
2. Header shows their account name (`/api/whoami`, from the `X-Bolt-User` header set by Caddy).
3. Link `https://bolt.hostbun.cc/git?url=https://github.com/pronnmark/resone.git` clones the repo
   into the in-browser WebContainer; no GitHub credentials are ever asked.
4. They prompt the model (OmniRoute, default `OpenAILike` / `coding`), see the **Preview** tab
   run the app, and push to `pronnmark/resone` via the git proxy.

## How it is wired
- Runs on pbox as transient user unit `bolt-diy` (`wrangler pages dev ./build/client`, `100.64.0.2:5173`).
  Rebuild with `pnpm build`, then `systemctl --user restart bolt-diy`.
- Edge: Caddy on hostbun, file `/data/coolify/proxy/caddy/dynamic/bolt.caddy` (root-owned; edit with
  `sudo -n`, reload `coolify-proxy`). Add a person = add a `basicauth` line (`caddy hash-password`).
- `app/routes/api.git-proxy.$.ts`: for `github.com` it injects the **server-side**
  `VITE_GITHUB_ACCESS_TOKEN` (from `.dev.vars`, never in the client bundle) **only for
  `pronnmark/resone`**; every other repo gets 401. Do not widen this.
- LLM: OmniRoute is the only provider (`.env.local`). Do not change model/provider without approval.
- bolt.diy has no real accounts: chats live in each browser; pushes all go out as Philip's GitHub user.

## Known state / verification (2026-09-30)
- Verified in headless Chromium: login, whoami, clone of resone through the proxy (200s), files load.
- NOT working/unverified: auto "Setup the codebase" command fails (`next: command not found`);
  manual `npm install` succeeds in the terminal. Preview with `npm run dev` (Next.js) crashed the
  headless test browser; unverified in a real Chrome. Push from the UI is untested (curl-only).
- Preview needs cross-origin isolation (COOP/COEP headers are present) and a real browser.

## Rules
- Validate changes against https://bolt.hostbun.cc, not just localhost.
- Never put the GitHub token in client code or commit it.
