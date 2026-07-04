# Student Portal

A React + Vite single-page app with a hardcoded login, a Student Details form, and a details summary page. Auth state and submitted form data live in `sessionStorage` — there's no backend database.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). Log in with:

- Username: `vibhav.kul`
- Password: `password`

## Run Automation Pack

The login page has a secondary "Run Automation Pack" button that doesn't require logging in. It triggers the Selenium test suite in the separate [`Student_Portal_Automation`](https://github.com/VibhavKul/Student_Portal_Automation) repo via GitHub's API, then shows a live status page while the pipeline runs.

This app has no CI/CD workflow files of its own — the Selenium pipeline lives entirely in the `Student_Portal_Automation` repo. This app only calls GitHub's REST API to dispatch and poll that repo's workflow.

### How it works

1. Clicking **Run Automation Pack** calls `POST /api/trigger-tests`, a Vercel serverless function that generates a unique `run_tag` and fires a `workflow_dispatch` event against `Student_Portal_Automation`'s `selenium-tests.yml` workflow.
2. The browser navigates to `/automation-status/{runTag}`, which polls `GET /api/run-status?runTag=...` every 3 seconds. That endpoint looks up the matching workflow run by name and returns its status, step-by-step progress, and (once available) the numeric run ID.
3. Once the run completes, the page shows a pass/fail summary and a **Download Report** button, which calls `GET /api/download-report?runId=...` to proxy the Extent Report artifact zip from GitHub back to the browser.

### Required environment variable

The three serverless functions under `/api` call GitHub's API on your behalf and need a **`GITHUB_PAT`** environment variable:

1. Generate a token at GitHub → Settings → Developer settings → Personal access tokens, with the **`repo`** and **`workflow`** scopes (needed to dispatch workflows and read run/artifact data, including on the automation repo).
2. In this project's Vercel dashboard: **Settings → Environment Variables** → add `GITHUB_PAT` with that token value.
3. **Redeploy** after adding it — Vercel only injects environment variables into new deployments, not the currently-running one.

### Local development limitation

`npm run dev` (Vite's dev server) does not run the `/api/*` serverless functions — those only execute on Vercel (or via `vercel dev`, if installed). Running the automation pack button locally will fail to reach `/api/trigger-tests` unless you use `vercel dev` with `GITHUB_PAT` set in a local `.env`. Full end-to-end testing of this feature requires an actual Vercel deployment with `GITHUB_PAT` configured.

## Tech stack

- React 18 + Vite
- React Router v6
- Plain CSS (no UI library)
- Vercel serverless functions (`/api`) for the automation pack integration
