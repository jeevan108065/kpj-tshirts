import React, { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../db/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 6, px: 2 }}>
        <Paper sx={{ p: 4, maxWidth: 420, width: "100%", textAlign: "center", borderRadius: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>Invalid or missing reset token.</Alert>
          <Link to="/forgot-password" style={{ color: "#3393E0", textDecoration: "none" }}>Request a new reset link</Link>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 6, px: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 4 }, maxWidth: 420, width: "100%", textAlign: "center", borderRadius: 3 }}>
        <LockResetIcon sx={{ fontSize: 48, color: "#3393E0", mb: 1 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: "#1E3A5F" }}>Set New Password</Typography>
        {done ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>Password reset successfully.</Alert>
            <Link to="/login" style={{ color: "#3393E0", textDecoration: "none", fontWeight: 600 }}>Go to Login</Link>
          </>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>{error}</Alert>}
            <TextField fullWidth label="New Password" type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }} sx={{ mb: 2 }} required />
            <TextField fullWidth label="Confirm Password" type="password" value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }} sx={{ mb: 2 }} required />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
              sx={{ background: "linear-gradient(135deg, #3393E0, #2578B5)", fontWeight: 700, py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
