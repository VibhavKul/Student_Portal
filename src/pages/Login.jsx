import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [automationLoading, setAutomationLoading] = useState(false);
  const [automationError, setAutomationError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Submit stays disabled until both fields have content.
  const canSubmit = username.trim() !== "" && password.trim() !== "";

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    if (login(username, password)) {
      navigate("/home", { replace: true });
    } else {
      setError("Invalid username or password");
    }
  }

  // Standalone trigger for the Selenium automation pack - independent of login.
  async function handleRunAutomation() {
    setAutomationLoading(true);
    setAutomationError("");
    try {
      const res = await fetch("/api/trigger-tests", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger automation pack");
      }
      navigate(`/automation-status/${data.runTag}`);
    } catch (err) {
      setAutomationError(err.message);
      setAutomationLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title" data-testid="login-title-display">Abhishek Student Portal</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={!canSubmit}>
            Log In
          </button>

          <button
            type="button"
            className="forgot-password-link"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>
        </form>

        {showForgotPassword && (
          <div className="modal-overlay" role="presentation">
            <div className="modal-dialog" role="dialog" aria-modal="true">
              <p className="modal-message">The functionality is not yet implemented...!</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowForgotPassword(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}

        <div className="automation-divider" />
        <p className="automation-hint">Want to test the pipeline without logging in?</p>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleRunAutomation}
          disabled={automationLoading}
        >
          {automationLoading ? "Starting..." : "Run Automation Pack"}
        </button>
        {automationError && <p className="error-text">{automationError}</p>}
      </div>
    </div>
  );
}
