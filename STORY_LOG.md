# Story / Feature Development Log — Student_Portal

> Tracks every feature built in this repo, in order. Updated automatically by the
> `feature-developer` subagent after each completed ticket (see CLAUDE.md).
> Format: newest entries at the bottom.

---

## Initial Build

**Date:** (fill in)
**What:** Core application scaffolded — React + Vite, React Router, login page
(hardcoded credentials: `vibhav.kul` / `password`), Student Details form, Details/Welcome
page. Deployed to Vercel with SPA rewrite rule (`vercel.json`) to fix client-side routing.
**Files:** src/pages/Login.jsx, src/pages/Home.jsx, src/pages/Details.jsx, vercel.json
**Status:** ✅ Live

---

## PBB-786 — Forgot Password Link

**Date:** (fill in)
**Requirement:** "Forgot Password" link on login page, under login button. On click,
shows a popup: "The functionality is not yet implemented...!" with an OK button that
closes it.
**Implementation notes:** Popup component pattern established here — reused for future
not-implemented features.
**data-testid values:** (fill in if known)
**Status:** ✅ Done — tested (see Student_Portal_Automation STORY_LOG)

---

## PBB-800 — Father's Name Field

**Date:** (fill in)
**Requirement:** New required text field "Father's Name" under "Full Name" on the
Student Details form. Value flows through to the Details/Welcome page.
**Implementation notes:** Same validation pattern as Full Name (alphabetic + spaces,
required). Added to sessionStorage `studentDetails` object and Edit Details pre-fill.
**data-testid values:** `father-name-input`, `father-name-display`
**Status:** ✅ Done — tested (3 scenarios: positive, empty-field, invalid-character)

---

## PBB-801 — Mother's Maiden Name Field

**Date:** (fill in)
**Requirement:** New required text field "Mother's Maiden Name" under "Father's Name."
Value flows through to the Details/Welcome page.
**Implementation notes:** Same pattern as Father's Name (PBB-800).
**data-testid values:** `mother-maiden-name-input`, `mother-maiden-name-display`
**Status:** ✅ Done — tested

---

## PBB-802 — Course/Program Dropdown

**Date:** (fill in)
**Requirement:** Replace the "Course / Program" free-text field with a predefined
dropdown of ~10 courses. Selected value flows through to the Details/Welcome page.
**Implementation notes:** Used a disabled placeholder option ("-- Select Course/Program --")
so the field starts unselected. Preserved existing sessionStorage key so nothing else
reading it broke. Options: Computer Science, Information Technology, Electronics &
Communication, Mechanical Engineering, Civil Engineering, Business Administration,
Commerce, Biotechnology, Mathematics, Physics.
**data-testid values:** `course-program-select` (or existing testid — confirm)
**Status:** ✅ Done — tested (3 scenarios: selection display, blocked submission on
placeholder, full option-list verification)

---

## PBB-803 — Review & Confirm Page

**Date:** 2026-07-13
**Requirement:** Insert a "Review & Confirm" page between the Student Details form and
the final Welcome/Details page. Submitting the form no longer finalizes the data
directly — the user must review a read-only summary and explicitly click "Confirm &
Submit" first.
**Implementation notes:** Renamed the Home form's submit button to "Review" (ticket
allowed either "Submit" or a renamed "Review" button). On valid submit, Home now writes
to a new sessionStorage key `pendingStudentDetails` (via new `savePendingStudentDetails`/
`getPendingStudentDetails`/`clearPendingStudentDetails` helpers in utils/storage.js)
instead of the final `studentDetails` key, then navigates to `/review`. The new
`Review.jsx` page reads the pending data and shows it as read-only label-value pairs
(same fields/order as the Details page), reusing `Details.css` styling. "Edit" navigates
back to `/home` with `state.editData` pre-filled, same pattern as the existing "Edit
Details" flow on the Details page — pending data is left untouched (not finalized).
"Confirm & Submit" promotes the pending data to the final `studentDetails` key via the
existing `saveStudentDetails`, clears the pending key, and navigates to `/details` (same
end result as the old direct-submit behavior). Added a new `requirePending` prop to
`ProtectedRoute` so `/review` isn't directly reachable without pending data in the
current session; `/details`'s existing `requireDetails` guard already prevents reaching
it without having gone through Confirm & Submit, since Home no longer writes the final
key itself.
**data-testid values:** `review-button` (Home's submit/review button, previously
untested), `review-edit-button`, `review-confirm-button`, and per-field review displays:
`full-name-review-display`, `father-name-review-display`,
`mother-maiden-name-review-display`, `student-id-review-display`, `dob-review-display`,
`email-review-display`, `phone-review-display`, `course-program-review-display`,
`year-review-display`, `address-review-display`.
**Status:** ✅ Done — awaiting tests

---

## Tooling / Infrastructure Milestones (not features, but relevant history)

- **CLAUDE.md** added — enforces commit-directly-to-main policy after Claude Code
  repeatedly defaulted to feature branches, silently breaking Vercel auto-deploy.
- **feature-developer subagent** added (`.claude/agents/feature-developer.md`) — handles
  new ticket implementation end-to-end without needing a long prompt each time.
- **vercel-webhook-relay** — attempted instant-trigger architecture for CI, abandoned due
  to persistent signature verification issue. Not connected to this repo's runtime; polling
  approach (in Student_Portal_Automation) is the active mechanism.

---

## Template for New Entries

```
## PBB-XXX — <Short Title>

**Date:** YYYY-MM-DD
**Requirement:** <one-line summary of the Given/When/Then>
**Implementation notes:** <anything non-obvious — patterns reused, assumptions made>
**data-testid values:** <list every new/changed testid>
**Status:** <In Progress | Done — awaiting tests | Done — tested>
```
