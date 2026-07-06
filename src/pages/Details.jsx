import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getStudentDetails } from "../utils/storage";
import "../styles/Details.css";

const FIELD_LABELS = [
  ["fullName", "Full Name"],
  ["fatherName", "Father's Name", "father-name-display"],
  ["studentId", "Student ID"],
  ["dob", "Date of Birth"],
  ["email", "Email"],
  ["phone", "Phone Number"],
  ["course", "Course / Program"],
  ["year", "Year / Semester"],
  ["address", "Address"],
];

export default function Details() {
  const navigate = useNavigate();
  const details = getStudentDetails();

  function handleEdit() {
    // Pass the existing data back to /home so the form can be pre-filled.
    navigate("/home", { state: { editData: details } });
  }

  return (
    <div className="page">
      <TopBar />
      <main className="content">
        <div className="details-card">
          <h2 className="section-title">Welcome, {details.fullName}</h2>

          <dl className="details-list">
            {FIELD_LABELS.map(([key, label, testId]) => (
              <div className="details-row" key={key}>
                <dt>{label}</dt>
                <dd {...(testId ? { "data-testid": testId } : {})}>
                  {details[key] || "—"}
                </dd>
              </div>
            ))}
          </dl>

          <button type="button" className="btn-primary" onClick={handleEdit}>
            Edit Details
          </button>
        </div>
      </main>
    </div>
  );
}
