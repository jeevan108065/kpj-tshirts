import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getUserProfile } from "../db/api";

const UserAuthContext = createContext(null);

export const useUserAuth = () => useContext(UserAuthContext);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kpj_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem("kpj_user_token"));

  useEffect(() => {
    const token = localStorage.getItem("kpj_user_token");
    if (!token) { setLoading(false); return; }
    getUserProfile()
      .then((u) => { setUser(u); localStorage.setItem("kpj_user", JSON.stringify(u)); })
      .catch(() => { setUser(null); localStorage.removeItem("kpj_user"); localStorage.removeItem("kpj_user_token"); })
      .finally(() => setLoading(false));
  }, []);

  const loginUser = useCallback((token, userData) => {
    localStorage.setItem("kpj_user_token", token);
    localStorage.setItem("kpj_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("kpj_user_token");
    localStorage.removeItem("kpj_user");
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, loginUser, logoutUser }), [user, loading, loginUser, logoutUser]);

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};
