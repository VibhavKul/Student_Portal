import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import {
  clearPendingStudentDetails,
  getPendingStudentDetails,
  saveStudentDetails,
} from "../utils/storage";
import "../styles/Details.css";

const FIELD_LABELS = [
  ["fullName", "Full Name", "full-name-review-display"],
  ["fatherName", "Father's Name", "father-name-review-display"],
  ["motherMaidenName", "Mother's Maiden Name", "mother-maiden-name-review-display"],
  ["studentId", "Student ID", "student-id-review-display"],
  ["dob", "Date of Birth", "dob-review-display"],
  ["email", "Email", "email-review-display"],
  ["phone", "Phone Number", "phone-review-display"],
  ["course", "Course / Program", "course-program-review-display"],
  ["year", "Year / Semester", "year-review-display"],
  ["address", "Address", "address-review-display"],
];

export default function Review() {
  const navigate = useNavigate();
  const details = getPendingStudentDetails();

  // ProtectedRoute (requirePending) guarantees this exists before render, but guard
  // defensively in case of a race on first paint.
  if (!details) return null;

  function handleEdit() {
    // Pass the pending data back to /home so the form can be pre-filled, same
    // pre-fill pattern used by the Details page's "Edit Details" flow. Nothing is
    // finalized — the pending data is left in place until re-submitted.
    navigate("/home", { state: { editData: details } });
  }

  function handleConfirm() {
    // Only now is the data written as "final" and reflected on the Details page.
    saveStudentDetails(details);
    clearPendingStudentDetails();
    navigate("/details");
  }

  return (
    <div className="page">
      <TopBar />
      <main className="content">
        <div className="details-card">
          <h2 className="section-title">Review &amp; Confirm</h2>
          <p className="review-hint">
            Please review your details below before confirming.
          </p>

          <dl className="details-list">
            {FIELD_LABELS.map(([key, label, testId]) => (
              <div className="details-row" key={key}>
                <dt>{label}</dt>
                <dd data-testid={testId}>{details[key] || "—"}</dd>
              </div>
            ))}
          </dl>

          <div className="review-actions">
            <button
              type="button"
              className="btn-secondary"
              data-testid="review-edit-button"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn-primary"
              data-testid="review-confirm-button"
              onClick={handleConfirm}
            >
              Confirm &amp; Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
