# Claude Code Instructions — Student_Portal

## Branching Policy (CRITICAL)
- ALWAYS commit and push directly to the `main` branch.
- NEVER create a new branch unless explicitly instructed to in a specific request.
- This repo is connected to Vercel with auto-deploy on push to `main` only. Any commit on another branch will NOT deploy and will break the live app's update flow silently.

## Project Context
- React + Vite app, deployed on Vercel, live at https://student-portal-kappa-ivory.vercel.app
- Contains small backend serverless functions under /api (trigger-tests, run-status, download-report) — these are application backend code, not CI/CD files.
- Do NOT add any .github/workflows files to this repo — CI/CD lives entirely in the separate Student_Portal_Automation repo.
- Has a vercel.json with a SPA rewrite rule (all routes → index.html) required for React Router — do not remove this.

## Before Making Changes
- Read this file first.
- Confirm you are committing to `main` before finishing any task.
