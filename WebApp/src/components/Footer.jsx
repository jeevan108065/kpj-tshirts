import React from "react";
import { Box, Container, Typography, Stack, IconButton, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import kpjLogo from "../assets/kpjLogo.svg";

const Footer = () => (
  <Box sx={{ background: "#1E3A5F", color: "#fff", pt: { xs: 4, md: 6 }, pb: 3 }}>
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* Brand */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <img src={kpjLogo} alt="KPJ" style={{ height: 32, marginRight: 10 }} />
            <Typography variant="h6" fontWeight={800}>KPJ</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 2, maxWidth: 300, fontSize: { xs: 13, md: 14 } }}>
            Your one-stop destination for premium custom apparel. From t-shirts to tracksuits, we deliver quality that speaks.
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton href="https://wa.me/918143670894" target="_blank" sx={{ color: "#25D366", bgcolor: "rgba(255,255,255,0.08)", "&:hover": { bgcolor: "rgba(37,211,102,0.15)" } }}>
              <WhatsAppIcon />
            </IconButton>
            <IconButton href="https://instagram.com/kpj_tshirts" target="_blank" sx={{ color: "#E4405F", bgcolor: "rgba(255,255,255,0.08)", "&:hover": { bgcolor: "rgba(228,64,95,0.15)" } }}>
              <InstagramIcon />
            </IconButton>
            <IconButton href="mailto:support@kpj.app" sx={{ color: "#3393E0", bgcolor: "rgba(255,255,255,0.08)", "&:hover": { bgcolor: "rgba(51,147,224,0.15)" } }}>
              <EmailIcon />
            </IconButton>
          </Stack>
        </Grid>

        {/* Products + Company side by side on mobile */}
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <Typography variant="subtitle2" sx={{ color: "#F5A623", mb: 1.5, fontWeight: 700, fontSize: { xs: 13, md: 14 } }}>Products</Typography>
          {["tshirts", "promotional", "sublimation", "uniforms", "tracks"].map((id) => (
            <Typography key={id} component={Link} to={`/kpj-garments/products/${id}`}
              sx={{ display: "block", color: "rgba(255,255,255,0.6)", textDecoration: "none", mb: 0.8, fontSize: { xs: 13, md: 14 }, "&:hover": { color: "#F5A623" } }}>
              {id === "tshirts" ? "T-Shirts" : id === "promotional" ? "Promotional" : id === "sublimation" ? "Sublimation" : id === "uniforms" ? "Uniforms" : "Tracks"}
            </Typography>
          ))}
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <Typography variant="subtitle2" sx={{ color: "#F5A623", mb: 1.5, fontWeight: 700, fontSize: { xs: 13, md: 14 } }}>Company</Typography>
          {[{ label: "Home", to: "/kpj-garments/" }, { label: "About", to: "/kpj-garments/about" }, { label: "Contact", to: "/kpj-garments/contact" }].map((item) => (
            <Typography key={item.to} component={Link} to={item.to}
              sx={{ display: "block", color: "rgba(255,255,255,0.6)", textDecoration: "none", mb: 0.8, fontSize: { xs: 13, md: 14 }, "&:hover": { color: "#F5A623" } }}>
              {item.label}
            </Typography>
          ))}
        </Grid>

        {/* Contact Info */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="subtitle2" sx={{ color: "#F5A623", mb: 1.5, fontWeight: 700, fontSize: { xs: 13, md: 14 } }}>Contact Info</Typography>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 18, color: "#3393E0" }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: { xs: 13, md: 14 } }}>
                <a href="tel:+918074175884" style={{ color: "inherit", textDecoration: "none" }}>+91 80741 75884</a>
                {" / "}
                <a href="tel:+918555909245" style={{ color: "inherit", textDecoration: "none" }}>+91 85559 09245</a>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EmailIcon sx={{ fontSize: 18, color: "#3393E0" }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: { xs: 13, md: 14 } }}>support@kpj.app</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 18, color: "#3393E0", mt: 0.3 }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: { xs: 13, md: 14 } }}>IT Sez Rushikonda, Visakhapatnam</Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", mt: { xs: 3, md: 4 }, pt: 2.5, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)", fontSize: { xs: 12, md: 14 } }}>
          © {new Date().getFullYear()} KPJ T-Shirts. All rights reserved.
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;
