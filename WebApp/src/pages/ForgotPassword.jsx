import React, { useState } from "react";
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Link } from "react-router-dom";
import { forgotPassword } from "../db/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 6, px: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 4 }, maxWidth: 420, width: "100%", textAlign: "center", borderRadius: 3 }}>
        <LockResetIcon sx={{ fontSize: 48, color: "#3393E0", mb: 1 }} />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: "#1E3A5F" }}>Reset Password</Typography>
        {sent ? (
          <>
            <Alert severity="success" sx={{ mb: 2, textAlign: "left" }}>
              If an account with that email exists, you'll receive a password reset link shortly. Check your inbox (and spam folder).
            </Alert>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <Link to="/login" style={{ color: "#3393E0", textDecoration: "none" }}>Back to Login</Link>
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: "#5A6F8A", mb: 3 }}>
              Enter your email and we'll send you a reset link.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>{error}</Alert>}
            <TextField fullWidth label="Email" type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }} sx={{ mb: 2 }} required />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
              sx={{ background: "linear-gradient(135deg, #3393E0, #2578B5)", fontWeight: 700, py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <Link to="/login" style={{ color: "#3393E0", textDecoration: "none" }}>Back to Login</Link>
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
