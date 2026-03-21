import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../theme";
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

  if (!authed) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AdminAuth onAuth={setAuthed} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route element={<AdminLayout onLogout={() => setAuthed(false)} />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="categories" element={<Categories />} />
          <Route path="payments" element={<PaymentMethods />} />
        </Route>
        <Route path="*" element={<Navigate to="/kpj-garments/admin" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default AdminApp;
