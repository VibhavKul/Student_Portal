// Small wrapper around sessionStorage so all keys/parsing logic live in one place.
const KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  STUDENT_DETAILS: "studentDetails",
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
}

export function saveStudentDetails(details) {
  sessionStorage.setItem(KEYS.STUDENT_DETAILS, JSON.stringify(details));
}

export function getStudentDetails() {
  const raw = sessionStorage.getItem(KEYS.STUDENT_DETAILS);
  return raw ? JSON.parse(raw) : null;
}
