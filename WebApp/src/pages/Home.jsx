import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button, Grid, Card, CardMedia, Chip, Stack, Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BrushIcon from "@mui/icons-material/Brush";
import GroupsIcon from "@mui/icons-material/Groups";
import StarIcon from "@mui/icons-material/Star";
import { categories, testimonials } from "../data/products";
import { getMetrics, fetchMetrics } from "../db/metricsService";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const Home = () => {
  const [metrics, setMetrics] = useState(getMetrics());
  useEffect(() => { fetchMetrics().then(setMetrics).catch(() => {}); }, []);

  const stats = [
    { value: metrics.tshirtsDelivered > 0 ? `${metrics.tshirtsDelivered.toLocaleString("en-IN")}+` : "50K+", label: "T-Shirts Delivered" },
    { value: metrics.happyClients > 0 ? `${metrics.happyClients}+` : "500+", label: "Happy Clients" },
    { value: metrics.expressDelivery || "48hr", label: "Express Delivery" },
    { value: metrics.satisfactionRate || "100%", label: "Satisfaction Rate" },
  ];

  return (
  <Box sx={{ width: "100%" }}>
    {/* Hero */}
    <Box sx={{
      minHeight: { xs: "70vh", sm: "75vh", md: "90vh" },
      display: "flex", alignItems: "center", position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg, #1E3A5F 0%, #122a4a 50%, #1a3a5c 100%)",
      py: { xs: 4, md: 0 },
    }}>
      <Box sx={{ position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: `url(https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1600&q=80)`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Chip label="Premium Custom Apparel" sx={{ mb: { xs: 2, md: 3 }, bgcolor: "rgba(245,166,35,0.15)", color: "#F5A623", fontWeight: 600, fontSize: { xs: 12, md: 14 } }} />
              <Typography variant="h1" sx={{
                color: "#fff",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3.2rem", lg: "3.8rem" },
                lineHeight: 1.15, mb: { xs: 2, md: 3 },
              }}>
                Wear Your Brand.<br />
                <Box component="span" sx={{ color: "#3393E0" }}>Stand Out.</Box>
              </Typography>
              <Typography variant="h6" sx={{
                color: "rgba(255,255,255,0.7)", fontWeight: 400,
                mb: { xs: 3, md: 4 }, maxWidth: 520, lineHeight: 1.6,
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.15rem" },
              }}>
                From custom t-shirts to corporate uniforms, sublimation prints to tracksuits — KPJ delivers premium apparel that makes an impact.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button component={Link} to="/kpj-garments/products/tshirts" variant="contained" size="large" endIcon={<ArrowForwardIcon />}
                  sx={{
                    background: "linear-gradient(135deg, #F5A623, #e8941a)", color: "#1E3A5F", fontWeight: 700,
                    px: { xs: 3, md: 4 }, py: 1.5, fontSize: { xs: 14, md: 16 },
                  }}>
                  Explore Products
                </Button>
                <Button component={Link} to="/kpj-garments/quote" variant="outlined" size="large"
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)", color: "#fff",
                    px: { xs: 3, md: 4 }, py: 1.5, fontSize: { xs: 14, md: 16 },
                    "&:hover": { borderColor: "#3393E0", bgcolor: "rgba(51,147,224,0.1)" },
                  }}>
                  Get a Quote
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <Box sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                <img src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80" alt="KPJ Custom Apparel" style={{ width: "100%", display: "block" }} />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>

    {/* Stats Bar */}
    <Box sx={{ background: "#3393E0", py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
          {stats.map((s) => (
            <Grid key={s.label} size={{ xs: 6, sm: 3 }} sx={{ textAlign: "center" }}>
              <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.4rem" } }}>
                {s.value}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500, fontSize: { xs: 11, sm: 13, md: 14 } }}>
                {s.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    {/* Product Categories */}
    <Box sx={{ py: { xs: 5, md: 10 }, bgcolor: "#F8FBFF" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 6 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#1E3A5F", mb: 1.5 }}>
            Our Product Range
          </Typography>
          <Typography variant="body1" sx={{ color: "#4A5568", maxWidth: 600, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
            Everything you need under one roof — from casual tees to professional uniforms
          </Typography>
        </Box>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {categories.map((cat, i) => (
            <Grid key={cat.id} size={{ xs: 6, sm: 6, md: i < 2 ? 6 : 4 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
                <Card component={Link} to={`/kpj-garments/products/${cat.id}`}
                  sx={{
                    textDecoration: "none", position: "relative", overflow: "hidden", borderRadius: { xs: 2, md: 3 },
                    height: { xs: 160, sm: 200, md: i < 2 ? 320 : 260 },
                    cursor: "pointer", "&:hover img": { transform: "scale(1.08)" },
                    "&:hover .overlay": { background: "rgba(10,22,40,0.6)" },
                  }}>
                  <CardMedia component="img" image={cat.image} alt={cat.name}
                    sx={{ height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                  <Box className="overlay" sx={{
                    position: "absolute", inset: 0, background: "rgba(10,22,40,0.45)", transition: "background 0.4s",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    p: { xs: 1.5, sm: 2, md: 3 },
                  }}>
                    <Typography variant="h5" sx={{ color: "#fff", mb: 0.5, fontSize: { xs: 14, sm: 16, md: 22 } }}>{cat.name}</Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", display: { xs: "none", sm: "block" }, fontSize: { sm: 12, md: 14 } }}>
                      {cat.description}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    {/* Why Choose KPJ */}
    <Box sx={{ py: { xs: 5, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#1E3A5F", mb: { xs: 2, md: 3 } }}>
              Why Choose <Box component="span" sx={{ color: "#3393E0" }}>KPJ?</Box>
            </Typography>
            <Stack spacing={{ xs: 2, md: 3 }}>
              {[
                { icon: <CheckCircleIcon sx={{ color: "#3393E0" }} />, title: "Premium Quality", desc: "Only the finest fabrics and inks for prints that last" },
                { icon: <BrushIcon sx={{ color: "#F5A623" }} />, title: "Custom Designs", desc: "Sublimation, DTF, screen printing — we do it all" },
                { icon: <LocalShippingIcon sx={{ color: "#3393E0" }} />, title: "Express Delivery", desc: "48-hour turnaround on most orders" },
                { icon: <GroupsIcon sx={{ color: "#F5A623" }} />, title: "No Minimums", desc: "Single piece or bulk — same quality, same care" },
              ].map((item) => (
                <Box key={item.title} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box sx={{ mt: 0.5 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: 16, md: 18 }, color: "#1E3A5F" }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#4A5568", fontSize: { xs: 13, md: 14 } }}>{item.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ borderRadius: { xs: 3, md: 4 }, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
              <img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80" alt="KPJ Quality" style={{ width: "100%", display: "block" }} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>

    {/* Testimonials */}
    <Box sx={{ py: { xs: 5, md: 10 }, bgcolor: "#1E3A5F" }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#fff", textAlign: "center", mb: { xs: 3, md: 6 } }}>
          What Our Clients Say
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {testimonials.map((t) => (
            <Grid key={t.name} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{
                bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: { xs: 2, md: 3 }, p: { xs: 2, md: 3 }, height: "100%",
              }}>
                <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
                  {Array.from({ length: 5 }).map((_, i) => <StarIcon key={`star-${t.name}-${i}`} sx={{ color: "#F5A623", fontSize: { xs: 16, md: 18 } }} />)}
                </Stack>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2, lineHeight: 1.7, fontSize: { xs: 13, md: 14 } }}>
                  "{t.text}"
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: "#3393E0", width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 }, fontSize: 14 }}>{t.name[0]}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600, fontSize: { xs: 13, md: 14 } }}>{t.name}</Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>{t.role}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    {/* CTA */}
    <Box sx={{ py: { xs: 5, md: 8 }, background: "linear-gradient(135deg, #3393E0 0%, #1a6fb5 100%)", textAlign: "center" }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ color: "#fff", fontSize: { xs: "1.3rem", sm: "1.6rem", md: "2.2rem" }, mb: 2 }}>
          Ready to Create Your Custom Apparel?
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", mb: { xs: 3, md: 4 }, maxWidth: 500, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
          Get in touch today for a free quote. No minimums, fast delivery, premium quality guaranteed.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ px: { xs: 2, sm: 0 } }}>
          <Button component={Link} to="/kpj-garments/contact" variant="contained" size="large"
            sx={{ background: "#F5A623", color: "#1E3A5F", fontWeight: 700, px: { xs: 3, md: 5 }, "&:hover": { background: "#e8941a" } }}>
            Contact Us
          </Button>
          <Button href="https://wa.me/918143670894" target="_blank" variant="outlined" size="large"
            sx={{ borderColor: "#fff", color: "#fff", px: { xs: 3, md: 5 }, "&:hover": { borderColor: "#F5A623", bgcolor: "rgba(255,255,255,0.1)" } }}>
            WhatsApp Us
          </Button>
        </Stack>
      </Container>
    </Box>
  </Box>
);
};

export default Home;
