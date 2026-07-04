import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/AutomationStatus.css";

const POLL_INTERVAL_MS = 3000;
const PENDING_WARNING_ATTEMPTS = 10; // ~30s of "pending" before we reassure the user

function getStepIcon(step) {
  if (step.status === "completed") {
    return step.conclusion === "success" ? "✅" : "❌";
  }
  return step.status === "in_progress" ? "🔄" : "⏳";
}

function getOverallLabel(status, conclusion) {
  if (status === "pending") return "Waiting for pipeline to start";
  if (status === "queued") return "Queued";
  if (status === "in_progress") return "Running";
  if (status === "completed") {
    return conclusion === "success" ? "Completed — Success" : "Completed — Failure";
  }
  return status;
}

function getOverallIcon(status, conclusion) {
  if (status === "completed") return conclusion === "success" ? "✅" : "❌";
  if (status === "in_progress") return "🔄";
  return "⏳";
}

export default function AutomationStatus() {
  const { runTag } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("pending");
  const [conclusion, setConclusion] = useState(null);
  const [steps, setSteps] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [runId, setRunId] = useState(null);
  const [error, setError] = useState("");
  const [pendingAttempts, setPendingAttempts] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const intervalRef = useRef(null);

  async function poll() {
    try {
      const res = await fetch(`/api/run-status?runTag=${encodeURIComponent(runTag)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch run status");
      }

      setError("");

      if (data.status === "pending") {
        setPendingAttempts((n) => n + 1);
        return;
      }

      setPendingAttempts(0);
      setStatus(data.status);
      setConclusion(data.conclusion ?? null);
      setSteps(data.steps || []);
      setTestResults(data.testResults ?? null);
      setRunId(data.runId ?? null);

      if (data.status === "completed" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTag]);

  async function handleDownload() {
    setDownloading(true);
    setError("");
    try {
      const res = await fetch(`/api/download-report?runId=${runId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to download report");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "extent-report.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  function handleRetry() {
    setError("");
    if (!intervalRef.current) {
      intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }
    poll();
  }

  const bannerClass = [
    "status-banner",
    `status-${status}`,
    status === "completed" ? `conclusion-${conclusion}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="page">
      <main className="content">
        <div className="automation-card">
          <h2 className="section-title">Automation Pack Run</h2>
          <p className="run-tag-label">
            Run tag: <code>{runTag}</code>
          </p>

          <div className={bannerClass}>
            <span className="status-icon">{getOverallIcon(status, conclusion)}</span>
            <span className="status-label">{getOverallLabel(status, conclusion)}</span>
          </div>

          {status === "pending" && pendingAttempts >= PENDING_WARNING_ATTEMPTS && (
            <p className="hint-text">
              Still waiting for the pipeline to start — this can take a moment.
            </p>
          )}

          {error && (
            <div className="automation-error">
              <p className="error-text">{error}</p>
              <button type="button" className="btn-secondary" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          {steps.length > 0 && (
            <ul className="step-list">
              {steps.map((step, i) => (
                <li key={`${step.name}-${i}`} className="step-item">
                  <span className="step-icon">{getStepIcon(step)}</span>
                  <span className="step-name">{step.name}</span>
                </li>
              ))}
            </ul>
          )}

          {status === "completed" && (
            <div className="summary-section">
              <h3>Summary</h3>
              <p className={`summary-result ${conclusion === "success" ? "success" : "failure"}`}>
                Overall result: {conclusion === "success" ? "Success" : "Failure"}
              </p>
              {testResults ? (
                <>
                  <p className="summary-counts">
                    Scenarios: {testResults.scenarios.passed} passed, {testResults.scenarios.failed} failed
                  </p>
                  <p className="summary-counts">
                    Steps: {testResults.steps.passed} passed, {testResults.steps.failed} failed
                  </p>
                </>
              ) : (
                <p className="summary-counts">Test result counts unavailable for this run.</p>
              )}
              <div className="summary-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleDownload}
                  disabled={downloading || !runId}
                >
                  {downloading ? "Downloading..." : "Download Report"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
