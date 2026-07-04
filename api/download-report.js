const AUTOMATION_REPO = "VibhavKul/Student_Portal_Automation";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { runId } = req.query;
  if (!runId) {
    return res.status(400).json({ error: "Missing runId query parameter" });
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
    const artifactsResponse = await fetch(
      `https://api.github.com/repos/${AUTOMATION_REPO}/actions/runs/${runId}/artifacts`,
      { headers }
    );

    if (!artifactsResponse.ok) {
      const details = await artifactsResponse.text();
      return res
        .status(502)
        .json({ error: `GitHub API error: ${artifactsResponse.status}`, details });
    }

    const artifactsData = await artifactsResponse.json();
    const artifact = (artifactsData.artifacts || []).find((a) =>
      a.name.toLowerCase().includes("extent-report")
    );

    if (!artifact) {
      return res
        .status(404)
        .json({ error: "Extent report artifact not found for this run. The run may not be complete yet." });
    }

    const downloadResponse = await fetch(artifact.archive_download_url, { headers });

    if (!downloadResponse.ok) {
      return res
        .status(502)
        .json({ error: `Failed to download artifact: ${downloadResponse.status}` });
    }

    const arrayBuffer = await downloadResponse.arrayBuffer();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="extent-report.zip"');
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
