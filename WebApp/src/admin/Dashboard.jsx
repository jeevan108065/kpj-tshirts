import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getMetrics } from "../db/api";
import { useToast } from "./ToastContext";

const Dashboard = () => {
  const [m, setM] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    getMetrics()
      .then(setM)
      .catch((err) => toast(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Leads", value: m.totalLeads || 0, icon: <PeopleIcon />, color: "#3393E0" },
    { label: "Quotations", value: m.totalQuotes || 0, icon: <ReceiptIcon />, color: "#F5A623" },
    { label: "Orders", value: m.totalOrders || 0, icon: <ShoppingCartIcon />, color: "#10B981" },
    { label: "Products", value: m.totalProducts || 0, icon: <InventoryIcon />, color: "#8B5CF6" },
    { label: "Items Delivered", value: m.tshirtsDelivered || 0, icon: <CheckCircleIcon />, color: "#EC4899" },
    { label: "Happy Clients", value: m.happyClients || 0, icon: <TrendingUpIcon />, color: "#F59E0B" },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", mb: 2, fontSize: { xs: 18, md: 24 } }}>Dashboard</Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          {cards.map((c) => (
            <Grid key={c.label} size={{ xs: 6, sm: 4, md: 4 }}>
              <Paper sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2, display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
                <Box sx={{ bgcolor: `${c.color}15`, color: c.color, borderRadius: 2, p: { xs: 1, md: 1.5 }, display: "flex" }}>
                  {React.cloneElement(c.icon, { sx: { fontSize: { xs: 20, md: 24 } } })}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 18, md: 24 } }}>{c.value}</Typography>
                  <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: { xs: 11, md: 14 }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
