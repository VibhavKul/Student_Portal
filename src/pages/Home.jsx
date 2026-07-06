import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { saveStudentDetails } from "../utils/storage";
import "../styles/Home.css";

const EMPTY_FORM = {
  fullName: "",
  fatherName: "",
  studentId: "",
  dob: "",
  email: "",
  phone: "",
  course: "",
  year: "",
  address: "",
};

const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th"];

const NAME_REGEX = /^[A-Za-z\s]+$/;

// Shared validation for name-like fields: required, alphabetic characters and spaces only.
function validateNameField(value, label) {
  if (!value.trim()) return `${label} is required`;
  return NAME_REGEX.test(value)
    ? ""
    : `${label} can only contain alphabetic characters and spaces`;
}

// Validates a single field and returns an error message, or "" if valid.
function validateField(name, value) {
  switch (name) {
    case "fullName":
      return validateNameField(value, "Full name");
    case "fatherName":
      return validateNameField(value, "Father's name");
    case "studentId":
      return value.trim() ? "" : "Student ID is required";
    case "dob":
      return value ? "" : "Date of birth is required";
    case "email":
      if (!value.trim()) return "Email is required";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ""
        : "Enter a valid email address";
    case "phone":
      if (!value.trim()) return "Phone number is required";
      return /^\d{10}$/.test(value) ? "" : "Enter a valid 10-digit phone number";
    case "course":
      return value.trim() ? "" : "Course / Program is required";
    case "year":
      return value ? "" : "Year / Semester is required";
    default:
      return "";
  }
}

export default function Home() {
  // If we arrived here via "Edit Details", pre-fill the form with the previous submission.
  const location = useLocation();
  const initialForm = location.state?.editData ?? EMPTY_FORM;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  // Required fields must all be non-empty and error-free before Submit is enabled.
  const requiredFields = [
    "fullName",
    "fatherName",
    "studentId",
    "dob",
    "email",
    "phone",
    "course",
    "year",
  ];
  const isFormValid = requiredFields.every(
    (field) => form[field].trim?.() !== "" && !validateField(field, form[field])
  );

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    requiredFields.forEach((field) => {
      newErrors[field] = validateField(field, form[field]);
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(requiredFields.map((f) => [f, true])));

    if (requiredFields.some((field) => newErrors[field])) return;

    saveStudentDetails(form);
    navigate("/details");
  }

  return (
    <div className="page">
      <TopBar />
      <main className="content">
        <div className="form-card">
          <h2 className="section-title">Student Details</h2>
          <form onSubmit={handleSubmit} noValidate className="details-form">
            <div className="form-field form-field-full">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="full-name-input"
              />
              {touched.fullName && errors.fullName && (
                <p className="error-text">{errors.fullName}</p>
              )}
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="fatherName">Father's Name</label>
              <input
                id="fatherName"
                name="fatherName"
                type="text"
                value={form.fatherName}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="father-name-input"
              />
              {touched.fatherName && errors.fatherName && (
                <p className="error-text">{errors.fatherName}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="studentId">Student ID / Roll Number</label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={form.studentId}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.studentId && errors.studentId && (
                <p className="error-text">{errors.studentId}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.dob && errors.dob && (
                <p className="error-text">{errors.dob}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="name@example.com"
              />
              {touched.email && errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10-digit number"
              />
              {touched.phone && errors.phone && (
                <p className="error-text">{errors.phone}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="course">Course / Program</label>
              <input
                id="course"
                name="course"
                type="text"
                value={form.course}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. B.Sc Computer Science"
              />
              {touched.course && errors.course && (
                <p className="error-text">{errors.course}</p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="year">Year / Semester</label>
              <select
                id="year"
                name="year"
                value={form.year}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {touched.year && errors.year && (
                <p className="error-text">{errors.year}</p>
              )}
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="address">Address (optional)</label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn-primary form-field-full"
              disabled={!isFormValid}
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
