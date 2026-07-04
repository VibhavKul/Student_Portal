import AdmZip from "adm-zip";

const AUTOMATION_REPO = "VibhavKul/Student_Portal_Automation";
const WORKFLOW_FILE = "selenium-tests.yml";
const ARTIFACT_NAME = "extent-report";

// Downloads the run's artifact zip and counts real scenario/step results from
// the Cucumber JSON report inside target/cucumber-reports/*.json - the GitHub
// Jobs API only has pipeline step names (checkout, setup JDK, etc), not test
// results, so it can't answer "how many scenarios passed".
async function fetchCucumberResults(headers, runIdValue) {
  const artifactsResponse = await fetch(
    `https://api.github.com/repos/${AUTOMATION_REPO}/actions/runs/${runIdValue}/artifacts`,
    { headers }
  );
  if (!artifactsResponse.ok) return null;

  const artifactsData = await artifactsResponse.json();
  const artifact = (artifactsData.artifacts || []).find((a) => a.name === ARTIFACT_NAME);
  if (!artifact) return null;

  const zipResponse = await fetch(artifact.archive_download_url, { headers });
  if (!zipResponse.ok) return null;

  const zipBuffer = Buffer.from(await zipResponse.arrayBuffer());
  const zip = new AdmZip(zipBuffer);
  const jsonEntries = zip
    .getEntries()
    .filter(
      (entry) =>
        !entry.isDirectory &&
        entry.entryName.toLowerCase().includes("cucumber-reports") &&
        entry.entryName.toLowerCase().endsWith(".json")
    );

  if (jsonEntries.length === 0) return null;

  let scenariosPassed = 0;
  let scenariosFailed = 0;
  let scenariosTotal = 0;
  let stepsPassed = 0;
  let stepsFailed = 0;
  let stepsTotal = 0;

  for (const entry of jsonEntries) {
    let features;
    try {
      features = JSON.parse(entry.getData().toString("utf8"));
    } catch {
      continue;
    }
    if (!Array.isArray(features)) continue;

    for (const feature of features) {
      for (const element of feature.elements || []) {
        if (element.type && element.type !== "scenario") continue;

        const stepStatuses = (element.steps || []).map((s) => s.result?.status);
        stepsTotal += stepStatuses.length;
        stepsPassed += stepStatuses.filter((s) => s === "passed").length;
        stepsFailed += stepStatuses.filter((s) => s === "failed").length;

        scenariosTotal += 1;
        if (stepStatuses.length > 0 && stepStatuses.every((s) => s === "passed")) {
          scenariosPassed += 1;
        } else if (stepStatuses.some((s) => s === "failed")) {
          scenariosFailed += 1;
        }
      }
    }
  }

  if (scenariosTotal === 0) return null;

  return {
    scenarios: { passed: scenariosPassed, failed: scenariosFailed, total: scenariosTotal },
    steps: { passed: stepsPassed, failed: stepsFailed, total: stepsTotal },
  };
}

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

    // Only pull the real Cucumber results once the run is done - this is the
    // one poll where we do the extra artifact download, since the frontend
    // stops polling as soon as it sees "completed".
    let testResults = null;
    if (match.status === "completed") {
      try {
        testResults = await fetchCucumberResults(headers, match.id);
      } catch (err) {
        console.log(
          `run-status: failed to fetch/parse cucumber results for run ${match.id}:`,
          err.message
        );
      }
    }

    return res.status(200).json({
      status: match.status,
      conclusion: match.conclusion,
      steps,
      runId: match.id,
      testResults,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
