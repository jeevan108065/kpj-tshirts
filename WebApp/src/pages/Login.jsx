import React, { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Tab, Tabs, Alert, CircularProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, Link } from "react-router-dom";
import { userLogin, userRegister } from "../db/api";
import { useUserAuth } from "../context/UserAuthContext";

const Login = () => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useUserAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === 0) {
        const { token, user } = await userLogin({ email: form.email, password: form.password });
        loginUser(token, user);
      } else {
        if (!form.name.trim()) { setError("Name is required"); setLoading(false); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
        if (!form.phone.trim()) { setError("Mobile number is required"); setLoading(false); return; }
        const { token, user } = await userRegister(form);
        loginUser(token, user);
      }
      navigate("/account");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 6, px: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 4 }, maxWidth: 420, width: "100%", textAlign: "center", borderRadius: 3 }}>
        <PersonIcon sx={{ fontSize: 48, color: "#3393E0", mb: 1 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: "#1E3A5F" }}>
          {tab === 0 ? "Welcome Back" : "Create Account"}
        </Typography>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(""); }} centered sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>{error}</Alert>}
        {tab === 1 && (
          <TextField fullWidth label="Full Name" value={form.name} onChange={set("name")} sx={{ mb: 2 }} required />
        )}
        <TextField fullWidth label="Email" type="email" value={form.email} onChange={set("email")} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Password" type="password" value={form.password} onChange={set("password")} sx={{ mb: 2 }} required />
        {tab === 1 && (
          <TextField fullWidth label="Mobile Number" value={form.phone} onChange={set("phone")} sx={{ mb: 2 }} required />
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
          sx={{ background: "linear-gradient(135deg, #3393E0, #2578B5)", fontWeight: 700, py: 1.5 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : tab === 0 ? "Login" : "Register"}
        </Button>
        {tab === 0 && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link to="/forgot-password" style={{ color: "#3393E0", textDecoration: "none" }}>Forgot password?</Link>
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
