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
    // GitHub can take a few seconds to register a new run, so the automation
    // repo's workflow must set the run name to the run_tag for this match to work.
    const match = (runsData.workflow_runs || []).find(
      (run) => run.name === runTag || run.display_title === runTag
    );

    if (!match) {
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
