import React from "react";
import { Box, Container, Typography, Grid, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import PrintIcon from "@mui/icons-material/Print";
import PaletteIcon from "@mui/icons-material/Palette";
import SpeedIcon from "@mui/icons-material/Speed";
import VerifiedIcon from "@mui/icons-material/Verified";
import kpjLogo from "../assets/kpjLogo.svg";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const services = [
  { icon: <PrintIcon sx={{ fontSize: 28 }} />, title: "Sublimation Printing", desc: "Vibrant, all-over prints that never fade, crack, or peel. Perfect for jerseys, fashion tees, and custom designs." },
  { icon: <PaletteIcon sx={{ fontSize: 28 }} />, title: "DTF Printing", desc: "Direct-to-Film technology for detailed, photo-quality prints on any fabric color." },
  { icon: <SpeedIcon sx={{ fontSize: 28 }} />, title: "Screen Printing", desc: "Classic screen printing for bulk orders with consistent, durable results." },
  { icon: <VerifiedIcon sx={{ fontSize: 28 }} />, title: "Embroidery", desc: "Professional embroidery for logos, monograms, and corporate branding." },
];

const About = () => (
  <Box sx={{ width: "100%" }}>
    {/* Hero */}
    <Box sx={{
      py: { xs: 5, md: 10 }, background: "linear-gradient(135deg, #1E3A5F 0%, #122a4a 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <img src={kpjLogo} alt="KPJ" style={{ height: 40, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 8 }} />
                <Typography variant="h6" sx={{ color: "#F5A623", fontWeight: 700, fontSize: { xs: 14, md: 18 } }}>Est. Visakhapatnam</Typography>
              </Box>
              <Typography variant="h2" sx={{
                color: "#fff", fontSize: { xs: "1.6rem", sm: "2rem", md: "2.8rem" },
                mb: { xs: 2, md: 3 }, lineHeight: 1.2,
              }}>
                Crafting Premium Apparel with <Box component="span" sx={{ color: "#3393E0" }}>Passion & Precision</Box>
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, mb: 2, fontSize: { xs: 14, md: 16 } }}>
                KPJ T-Shirts is Visakhapatnam's trusted name in custom apparel. We specialize in sublimation, DTF, and screen printing — delivering everything from single custom pieces to large-scale bulk orders with the same dedication to quality.
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: { xs: 14, md: 16 } }}>
                Whether you need promotional tees for a campaign, uniforms for your team, or trendy streetwear — we bring your vision to life on fabric.
              </Typography>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <Box sx={{ borderRadius: { xs: 3, md: 4 }, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80" alt="KPJ Workshop" style={{ width: "100%", display: "block" }} />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>

    {/* Services */}
    <Box sx={{ py: { xs: 5, md: 10 }, bgcolor: "#F8FBFF" }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: "center", fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#1E3A5F", mb: 1.5 }}>
          Our Printing Services
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center", color: "#4A5568", mb: { xs: 3, md: 6 }, maxWidth: 500, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
          State-of-the-art printing technology for every need
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {services.map((s) => (
            <Grid key={s.title} size={{ xs: 6, sm: 6, md: 3 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Box sx={{
                  p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 }, bgcolor: "#fff", border: "1px solid #E2E8F0", height: "100%",
                  transition: "all 0.3s", "&:hover": { boxShadow: "0 8px 30px rgba(51,147,224,0.12)", borderColor: "#3393E0" },
                }}>
                  <Avatar sx={{ bgcolor: "rgba(51,147,224,0.1)", color: "#3393E0", width: { xs: 44, md: 56 }, height: { xs: 44, md: 56 }, mb: 1.5 }}>
                    {s.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontSize: { xs: 14, md: 18 }, color: "#1E3A5F", mb: 0.5 }}>{s.title}</Typography>
                  <Typography variant="body2" sx={{ color: "#4A5568", lineHeight: 1.7, fontSize: { xs: 12, md: 14 } }}>{s.desc}</Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    {/* Values */}
    <Box sx={{ py: { xs: 5, md: 10 } }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#1E3A5F", mb: { xs: 3, md: 6 } }}>
          What Drives Us
        </Typography>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {[
            { emoji: "🎯", title: "Quality First", desc: "We never compromise on fabric quality or print precision" },
            { emoji: "⚡", title: "Speed", desc: "48-hour express delivery on most orders" },
            { emoji: "🤝", title: "Trust", desc: "Transparent pricing, no hidden costs, 100% satisfaction" },
            { emoji: "🎨", title: "Creativity", desc: "Free design assistance to bring your ideas to life" },
          ].map((v) => (
            <Grid key={v.title} size={{ xs: 6, md: 3 }}>
              <Typography sx={{ fontSize: { xs: 32, md: 40 }, mb: 1 }}>{v.emoji}</Typography>
              <Typography variant="h6" sx={{ fontSize: { xs: 14, md: 16 }, color: "#1E3A5F", mb: 0.5 }}>{v.title}</Typography>
              <Typography variant="body2" sx={{ color: "#4A5568", fontSize: { xs: 12, md: 14 } }}>{v.desc}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  </Box>
);

export default About;
