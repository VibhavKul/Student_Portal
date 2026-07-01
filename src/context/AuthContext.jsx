import { createContext, useContext, useState } from "react";
import {
  clearSession,
  isLoggedIn as checkIsLoggedIn,
  setLoggedIn as persistLoggedIn,
} from "../utils/storage";

// Hardcoded credentials per spec - no backend involved.
const VALID_USERNAME = "vibhav.kul";
const VALID_PASSWORD = "password";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Seed React state from sessionStorage so a page refresh keeps the user logged in.
  const [loggedIn, setLoggedIn] = useState(checkIsLoggedIn);

  function login(username, password) {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      persistLoggedIn();
      setLoggedIn(true);
      return true;
    }
    return false;
  }

  function logout() {
    clearSession();
    setLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
