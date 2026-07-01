import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStudentDetails } from "../utils/storage";

// Guards a route behind login, and optionally behind "form already submitted".
// requireDetails=true is used for /details, which shouldn't be reachable
// until the student has submitted the form on /home at least once.
export default function ProtectedRoute({ children, requireDetails = false }) {
  const { loggedIn } = useAuth();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireDetails && !getStudentDetails()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
