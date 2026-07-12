// Small wrapper around sessionStorage so all keys/parsing logic live in one place.
const KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  STUDENT_DETAILS: "studentDetails",
  // Holds the form values while the user is on the Review & Confirm page, before
  // they've been finalized. Only promoted to STUDENT_DETAILS on "Confirm & Submit".
  PENDING_STUDENT_DETAILS: "pendingStudentDetails",
};

export function setLoggedIn() {
  sessionStorage.setItem(KEYS.IS_LOGGED_IN, "true");
}

export function isLoggedIn() {
  return sessionStorage.getItem(KEYS.IS_LOGGED_IN) === "true";
}

export function clearSession() {
  sessionStorage.removeItem(KEYS.IS_LOGGED_IN);
  sessionStorage.removeItem(KEYS.STUDENT_DETAILS);
  sessionStorage.removeItem(KEYS.PENDING_STUDENT_DETAILS);
}

export function saveStudentDetails(details) {
  sessionStorage.setItem(KEYS.STUDENT_DETAILS, JSON.stringify(details));
}

export function getStudentDetails() {
  const raw = sessionStorage.getItem(KEYS.STUDENT_DETAILS);
  return raw ? JSON.parse(raw) : null;
}

// Pending details: written when the user submits the Student Details form and is
// routed to Review & Confirm, but not yet finalized. Consumed/cleared once the user
// clicks "Confirm & Submit" on the Review page (at which point it's promoted via
// saveStudentDetails above).
export function savePendingStudentDetails(details) {
  sessionStorage.setItem(KEYS.PENDING_STUDENT_DETAILS, JSON.stringify(details));
}

export function getPendingStudentDetails() {
  const raw = sessionStorage.getItem(KEYS.PENDING_STUDENT_DETAILS);
  return raw ? JSON.parse(raw) : null;
}

export function clearPendingStudentDetails() {
  sessionStorage.removeItem(KEYS.PENDING_STUDENT_DETAILS);
}
