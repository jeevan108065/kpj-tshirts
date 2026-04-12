import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Paper, Button, Chip, CircularProgress, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { getMyQuotes, getMyOrders } from "../db/api";

const statusColor = { draft: "default", sent: "info", accepted: "success", rejected: "error", pending: "warning", processing: "info", delivered: "success", cancelled: "error" };

const Account = () => {
  const { user, logoutUser, loading: authLoading } = useUserAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login", { replace: true }); return; }
    if (!user) return;
    Promise.all([getMyQuotes().catch(() => []), getMyOrders().catch(() => [])])
      .then(([q, o]) => { setQuotes(q); setOrders(o); })
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  if (authLoading || (!user && !authLoading)) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;

  const handleLogout = () => { logoutUser(); navigate("/"); };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1E3A5F">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}{user.phone ? ` • ${user.phone}` : ""}</Typography>
          </Box>
          <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
        </Box>
      </Paper>

      <Typography variant="h6" fontWeight={700} color="#1E3A5F" sx={{ mb: 2 }}>My Quotes</Typography>
      {loading ? <CircularProgress size={24} /> : quotes.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No quotes found for your email.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          {quotes.map((q) => (
            <Paper key={q.id} sx={{ p: 2.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Typography fontWeight={600}>{q.quote_number || `#${q.id}`}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(q.created_at).toLocaleDateString()} • {q.total_qty} items
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography fontWeight={700}>₹{Number(q.grand_total).toLocaleString()}</Typography>
                <Chip label={q.status} size="small" color={statusColor[q.status] || "default"} />
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={700} color="#1E3A5F" sx={{ mb: 2 }}>My Orders</Typography>
      {loading ? <CircularProgress size={24} /> : orders.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
          <Typography color="text.secondary">No orders found.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {orders.map((o) => (
            <Paper key={o.id} sx={{ p: 2.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Typography fontWeight={600}>Order #{o.id} — {o.client_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(o.created_at).toLocaleDateString()} • {o.total_qty} items
                  {o.delivered_at ? ` • Delivered ${new Date(o.delivered_at).toLocaleDateString()}` : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography fontWeight={700}>₹{Number(o.total_amount).toLocaleString()}</Typography>
                <Chip label={o.status} size="small" color={statusColor[o.status] || "default"} />
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Account;
