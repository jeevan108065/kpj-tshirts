import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../theme";
import { ToastProvider } from "./ToastContext";
import AdminAuth from "./AdminAuth";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Leads from "./Leads";
import Quotes from "./Quotes";
import Orders from "./Orders";
import Inventory from "./Inventory";
import Categories from "./Categories";
import PaymentMethods from "./PaymentMethods";

const AdminApp = () => {
  const [authed, setAuthed] = useState(sessionStorage.getItem("kpj_admin") === "1");

  // Listen for 401 session expiry — poll sessionStorage changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (authed && sessionStorage.getItem("kpj_admin") !== "1") {
        setAuthed(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [authed]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("kpj_admin");
    sessionStorage.removeItem("kpj_admin_token");
    setAuthed(false);
  }, []);

  if (!authed) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <AdminAuth onAuth={setAuthed} />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <Routes>
          <Route element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="categories" element={<Categories />} />
            <Route path="payments" element={<PaymentMethods />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default AdminApp;
