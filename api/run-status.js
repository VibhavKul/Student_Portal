const AUTOMATION_REPO = "VibhavKul/Student_Portal_Automation";
const WORKFLOW_FILE = "selenium-tests.yml";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { runTag } = req.query;
  if (!runTag) {
    return res.status(400).json({ error: "Missing runTag query parameter" });
  }

  const githubPat = process.env.GITHUB_PAT;
  if (!githubPat) {
    return res.status(500).json({ error: "GITHUB_PAT is not configured on the server" });
  }

  const headers = {
    Authorization: `Bearer ${githubPat}`,
    Accept: "application/vnd.github+json",
  };

  try {
    const runsResponse = await fetch(
      `https://api.github.com/repos/${AUTOMATION_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=10`,
      { headers }
    );

    if (!runsResponse.ok) {
      const details = await runsResponse.text();
      return res
        .status(502)
        .json({ error: `GitHub API error: ${runsResponse.status}`, details });
    }

    const runsData = await runsResponse.json();
    const runs = runsData.workflow_runs || [];
    // `name` is the static workflow name (same for every run) and never contains
    // the run_tag - only `display_title` (set via the workflow's `run-name:`)
    // carries it, and it's wrapped in extra text (e.g. "UI-triggered: <tag>"),
    // so this has to be a substring match, not strict equality.
    const match = runs.find(
      (run) => typeof run.display_title === "string" && run.display_title.includes(runTag)
    );

    if (!match) {
      console.log(
        `run-status: no match for runTag="${runTag}". Recent display_title values:`,
        runs.slice(0, 5).map((run) => run.display_title)
      );
      return res.status(200).json({ status: "pending" });
    }

    const jobsResponse = await fetch(
      `https://api.github.com/repos/${AUTOMATION_REPO}/actions/runs/${match.id}/jobs`,
      { headers }
    );

    if (!jobsResponse.ok) {
      const details = await jobsResponse.text();
      return res
        .status(502)
        .json({ error: `GitHub API error: ${jobsResponse.status}`, details });
    }

    const jobsData = await jobsResponse.json();
    const steps = (jobsData.jobs || []).flatMap((job) =>
      (job.steps || []).map((step) => ({
        name: step.name,
        status: step.status,
        conclusion: step.conclusion,
      }))
    );

    return res.status(200).json({
      status: match.status,
      conclusion: match.conclusion,
      steps,
      runId: match.id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
