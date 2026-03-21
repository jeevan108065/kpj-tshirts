import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer,
  List, ListItem, ListItemText, Collapse, Container, Menu, MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { Link, useLocation } from "react-router-dom";
import kpjLogo from "../assets/kpjLogo.svg";

const productLinks = [
  { label: "T-Shirts", to: "/products/tshirts" },
  { label: "Promotional T-Shirts", to: "/products/promotional" },
  { label: "Sublimation T-Shirts", to: "/products/sublimation" },
  { label: "Uniforms", to: "/products/uniforms" },
  { label: "Tracks & Tracksuits", to: "/products/tracks" },
];

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isProductActive = productLinks.some((p) => location.pathname === p.to);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(10, 22, 40, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(51,147,224,0.15)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0 }, minHeight: { xs: 56, md: 72 } }} disableGutters>
            {/* Logo */}
            <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", mr: { xs: 1, md: 4 } }}>
              <img src={kpjLogo} alt="KPJ Logo" style={{ height: 32 }} />
            </Box>

            {/* Desktop Nav */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5, flexGrow: 1 }}>
              <Button component={Link} to="/" sx={{ color: isActive("/") ? "#F5A623" : "#fff", fontWeight: 600, "&:hover": { color: "#F5A623" } }}>
                Home
              </Button>
              <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ExpandMore />}
                sx={{ color: isProductActive ? "#F5A623" : "#fff", fontWeight: 600, "&:hover": { color: "#F5A623" } }}
              >
                Products
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1, background: "rgba(10,22,40,0.97)", backdropFilter: "blur(20px)",
                      border: "1px solid rgba(51,147,224,0.2)", borderRadius: 2, minWidth: 240,
                    },
                  },
                }}
              >
                {productLinks.map((item) => (
                  <MenuItem
                    key={item.to}
                    component={Link}
                    to={item.to}
                    onClick={() => setAnchorEl(null)}
                    sx={{
                      color: isActive(item.to) ? "#F5A623" : "#fff",
                      "&:hover": { background: "rgba(51,147,224,0.15)", color: "#F5A623" },
                      py: 1.2, px: 3, fontSize: 15,
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
              <Button component={Link} to="/about" sx={{ color: isActive("/about") ? "#F5A623" : "#fff", fontWeight: 600, "&:hover": { color: "#F5A623" } }}>
                About
              </Button>
              <Button component={Link} to="/contact" sx={{ color: isActive("/contact") ? "#F5A623" : "#fff", fontWeight: 600, "&:hover": { color: "#F5A623" } }}>
                Contact
              </Button>
            </Box>

            {/* CTA */}
            <Button
              component={Link}
              to="/quote"
              variant="contained"
              size="small"
              sx={{ display: { xs: "none", md: "flex" }, background: "linear-gradient(135deg, #F5A623, #e8941a)", color: "#1E3A5F", fontWeight: 700, "&:hover": { background: "#e8941a" } }}
            >
              Get Quote
            </Button>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { md: "none" }, ml: "auto", color: "#fff" }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobile}
        slotProps={{
          paper: {
            sx: {
              width: "85vw",
              maxWidth: 320,
              background: "#1E3A5F",
              color: "#fff",
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={kpjLogo} alt="KPJ" style={{ height: 28 }} />
            <Typography variant="h6" fontWeight={700}>KPJ</Typography>
          </Box>
          <IconButton onClick={closeMobile} sx={{ color: "#fff" }} aria-label="Close navigation menu"><CloseIcon /></IconButton>
        </Box>
        <List sx={{ flex: 1, py: 1 }}>
          <ListItem
            component={Link} to="/" onClick={closeMobile}
            sx={{ color: isActive("/") ? "#F5A623" : "#fff", py: 1.5 }}
          >
            <ListItemText primary="Home" slotProps={{ primary: { fontSize: 16, fontWeight: 500 } }} />
          </ListItem>

          <ListItem
            onClick={() => setProductsOpen(!productsOpen)}
            sx={{ color: isProductActive ? "#F5A623" : "#fff", cursor: "pointer", py: 1.5 }}
          >
            <ListItemText primary="Products" slotProps={{ primary: { fontSize: 16, fontWeight: 500 } }} />
            {productsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={productsOpen}>
            <List disablePadding>
              {productLinks.map((item) => (
                <ListItem
                  key={item.to} component={Link} to={item.to} onClick={closeMobile}
                  sx={{ pl: 4, py: 1.2, color: isActive(item.to) ? "#F5A623" : "rgba(255,255,255,0.7)", "&:hover": { color: "#F5A623" } }}
                >
                  <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 14 } }} />
                </ListItem>
              ))}
            </List>
          </Collapse>

          {navLinks.slice(1).map((item) => (
            <ListItem
              key={item.to} component={Link} to={item.to} onClick={closeMobile}
              sx={{ color: isActive(item.to) ? "#F5A623" : "#fff", py: 1.5 }}
            >
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 16, fontWeight: 500 } }} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Button
            component={Link} to="/quote" variant="contained" fullWidth onClick={closeMobile}
            sx={{ background: "linear-gradient(135deg, #F5A623, #e8941a)", color: "#1E3A5F", fontWeight: 700, py: 1.5 }}
          >
            Get Quote
          </Button>
        </Box>
      </Drawer>

      {/* Spacer */}
      <Toolbar sx={{ minHeight: { xs: 56, md: 72 } }} />
    </>
  );
};

export default Header;
