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

## How it is wired (corrected 2026-09-30)
- **Runs on Coolify, not on pbox.** App `bolt-diy-ovh` (uuid `s0ik0oqbvrea15zieh3ukl9c`) on server
  `ovh-omniroute` (`100.64.0.16`), Dockerfile build pack from GitHub `pronnmark/bolt.diy` branch `main`,
  container port 5173 (published on host 5173). Env (OmniRoute provider, `BOLT_GITHUB_TOKEN`) lives in Coolify.
  Deploy: `git push fork main`, then `coolify deploy name bolt-diy-ovh` and poll `coolify deploy get <uuid>`
  until `finished`. A redeploy causes ~1 min of 502s. Coolify internal URL `bolt2.hostbun.cc` is not the one people use.
- The old pbox unit `bolt-diy` (`100.64.0.2:5173`) is **legacy and not in the path**; do not debug it.
- Edge: Caddy on hostbun, `/data/coolify/proxy/caddy/dynamic/bolt.caddy` (root-owned; `sudo -n`), upstream
  `reverse_proxy 100.64.0.16:5173`. Accounts are `basicauth` lines (`caddy hash-password`); `resone`/`resone` and
  `ddash`/`ddash` exist (keyvault `bolt-diy/basic-auth*`). Caddy sets `X-Bolt-User`.
- `app/routes/api.git-proxy.$.ts`: for `github.com` injects the server-side `BOLT_GITHUB_TOKEN` **only for
  `pronnmark/resone`**; every other repo gets 401. Do not widen this.
- `app/utils/projectCommands.ts`: setup command is plain `npm install` (an earlier `npx update-browserslist-db`
  step made the WebContainer skip deps -> `next: command not found`). Keep setup to `npm install`.
- LLM: OmniRoute only. Do not change model/provider without approval.
- No real accounts: chats live in each browser; pushes go out as Philip's GitHub user.

## Verification (2026-09-30)
- Real-browser test (playwright-core from `~/uppl/node_modules`, `httpCredentials` resone/resone, NOT `user:pass@` in the
  URL - that breaks every fetch): open `/git?url=https://github.com/pronnmark/resone.git`, wait ~2.5 min; terminal shows
  `vite ready`, Preview tab renders Résone. Write screenshots to a unique dir - `/tmp` is shared and files get clobbered.
- Preview needs cross-origin isolation (COOP/COEP present) and a real browser over HTTPS.

## Rules
- Validate changes against https://bolt.hostbun.cc, not just localhost.
- Never put the GitHub token in client code or commit it.
