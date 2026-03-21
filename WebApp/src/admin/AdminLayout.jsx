import React, { useState } from "react";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const DRAWER_WIDTH = 240;

const menuItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
  { label: "Leads", icon: <PeopleIcon />, path: "/admin/leads" },
  { label: "Quotations", icon: <ReceiptIcon />, path: "/admin/quotes" },
  { label: "Orders", icon: <ShoppingCartIcon />, path: "/admin/orders" },
  { label: "Inventory", icon: <InventoryIcon />, path: "/admin/inventory" },
  { label: "Categories", icon: <CategoryIcon />, path: "/admin/categories" },
  { label: "Payments", icon: <PaymentIcon />, path: "/admin/payments" },
];

const AdminLayout = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#3393E0" }}>KPJ</Typography>
        <Typography variant="body2" sx={{ color: "#5A6F8A" }}>Admin</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton key={item.path} selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              py: 1.2,
              "&.Mui-selected": { bgcolor: "rgba(51,147,224,0.1)", color: "#3393E0", "& .MuiListItemIcon-root": { color: "#3393E0" } },
            }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 14 } }} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={() => { sessionStorage.removeItem("kpj_admin"); sessionStorage.removeItem("kpj_admin_token"); onLogout(); }}>
          <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      {/* Desktop drawer */}
      <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, width: DRAWER_WIDTH, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>
        {drawer}
      </Drawer>
      {/* Mobile drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
        {drawer}
      </Drawer>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
          <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 1.5, md: 3 } }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: "none" }, mr: 1 }} aria-label="Open menu"><MenuIcon /></IconButton>
            <Typography variant="h6" sx={{ color: "#1E3A5F", fontWeight: 700, fontSize: { xs: 16, md: 20 } }}>KPJ Admin</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2, md: 3 }, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
