import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/TopBar.css";

export default function TopBar({ title = "Student Portal" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <button type="button" className="topbar-logout" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}
