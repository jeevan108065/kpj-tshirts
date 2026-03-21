import React, { useState } from "react";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { login } from "../db/api";

const AdminAuth = ({ onAuth }) => {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setErrMsg("");
    try {
      const { token } = await login(pass);
      sessionStorage.setItem("kpj_admin", "1");
      sessionStorage.setItem("kpj_admin_token", token);
      onAuth(true);
    } catch (err) {
      setError(true);
      setErrMsg(err.message || "Login failed");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f4f8", px: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 4 }, maxWidth: 380, width: "100%", textAlign: "center", borderRadius: 3 }}>
        <LockIcon sx={{ fontSize: 48, color: "#3393E0", mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 20, md: 24 } }}>Admin Access</Typography>
        <Typography variant="body2" sx={{ color: "#5A6F8A", mb: 3 }}>Enter password to continue</Typography>
        <TextField
          type="password" fullWidth label="Password" value={pass}
          onChange={(e) => { setPass(e.target.value); setError(false); setErrMsg(""); }}
          error={error} helperText={error ? errMsg || "Incorrect password" : ""}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" fullWidth size="large"
          sx={{ background: "linear-gradient(135deg, #3393E0, #2578B5)", fontWeight: 700, py: 1.5 }}>
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default AdminAuth;
