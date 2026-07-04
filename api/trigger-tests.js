const AUTOMATION_REPO = "VibhavKul/Student_Portal_Automation";
const WORKFLOW_FILE = "selenium-tests.yml";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const githubPat = process.env.GITHUB_PAT;
  if (!githubPat) {
    return res.status(500).json({ error: "GITHUB_PAT is not configured on the server" });
  }

  const runTag = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${AUTOMATION_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubPat}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main", inputs: { run_tag: runTag } }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      return res
        .status(502)
        .json({ error: `GitHub API error: ${response.status}`, details });
    }

    return res.status(200).json({ runTag });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
