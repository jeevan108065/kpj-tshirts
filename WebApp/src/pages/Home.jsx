import React, { useEffect, useState, useRef } from "react";
import {
  Box, Container, Typography, Button, Grid, Card, CardMedia, Chip, Stack,
  Avatar, TextField, Rating, Snackbar, Alert, CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BrushIcon from "@mui/icons-material/Brush";
import GroupsIcon from "@mui/icons-material/Groups";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SportsIcon from "@mui/icons-material/Sports";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import SendIcon from "@mui/icons-material/Send";
import { getMetrics, fetchMetrics } from "../db/metricsService";
import { getCategories, getProducts, getReviews, submitReview } from "../db/api";
import SEO from "../components/SEO";

// Local images
import heroImg from "../assets/hero-tshirts.jpg";
import catTshirts from "../assets/cat-tshirts.jpg";
import catPromotional from "../assets/cat-promotional.jpg";
import catSublimation from "../assets/cat-sublimation.jpg";
import catUniforms from "../assets/cat-uniforms.jpg";
import catTracks from "../assets/cat-tracks.jpg";
import catShorts from "../assets/cat-shorts.jpg";
import catSchool from "../assets/cat-school.jpg";
import catCollege from "../assets/cat-college.jpg";
import catProfessional from "../assets/cat-professional.jpg";
import whyQuality from "../assets/why-quality.jpg";

// Category image map (fallback for API categories)
const categoryImageMap = {
  "t-shirts": catTshirts,
  "tshirts": catTshirts,
  "promotional": catPromotional,
  "promotional t-shirts": catPromotional,
  "sublimation": catSublimation,
  "sublimation t-shirts": catSublimation,
  "uniforms": catUniforms,
  "tracks": catTracks,
  "tracks & tracksuits": catTracks,
  "shorts": catShorts,
  "school": catSchool,
  "college": catCollege,
  "professional": catProfessional,
};

function getCategoryImage(name) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(categoryImageMap)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return catTshirts;
}

// Category slug for linking
function getCategorySlug(name) {
  const map = {
    "t-shirts": "tshirts", "promotional t-shirts": "promotional",
    "sublimation t-shirts": "sublimation", "uniforms": "uniforms",
    "tracks & tracksuits": "tracks",
  };
  const key = name.toLowerCase();
  return map[key] || key.replace(/\s+/g, "-");
}

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" } }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};
const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

// ─── Counter Animation Hook (5 seconds) ───
function useCountUp(end, duration = 5000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView || !inView || started.current) return;
    started.current = true;
    const numEnd = typeof end === "number" ? end : Number.parseInt(String(end).replace(/[^0-9]/g, ""), 10);
    if (!numEnd || Number.isNaN(numEnd)) { setCount(0); return; }
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * numEnd));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, end, duration, startOnView]);

  return { count, ref };
}

// ─── Counter Stat Component ───
function AnimatedStat({ value, label, suffix = "" }) {
  const numericValue = typeof value === "number" ? value : Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
  const isNumeric = numericValue > 0 && !Number.isNaN(numericValue);
  const { count, ref } = useCountUp(isNumeric ? numericValue : 0, 5000);

  return (
    <Box ref={ref} sx={{ textAlign: "center" }}>
      <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.4rem" } }}>
        {isNumeric ? `${count.toLocaleString("en-IN")}${suffix}` : value}
      </Typography>
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500, fontSize: { xs: 11, sm: 13, md: 14 } }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Showcase items for "What We Do" ───
const showcaseItems = [
  { icon: <SchoolIcon />, title: "School & College Uniforms", desc: "Custom uniforms for schools, colleges, and institutions with durable fabrics and professional finishing.", color: "#3393E0" },
  { icon: <BusinessCenterIcon />, title: "Corporate & Professional", desc: "MBA batch tees, corporate polos, and professional workwear with embroidery and custom branding.", color: "#F5A623" },
  { icon: <SportsIcon />, title: "Tracks, Shorts & Sportswear", desc: "Performance tracksuits, shorts, joggers, and sports jerseys for teams and fitness enthusiasts.", color: "#3393E0" },
  { icon: <BrushIcon />, title: "Custom Printed Garments", desc: "Sublimation, DTF, screen printing — bring any design to life on premium quality fabrics.", color: "#F5A623" },
];

// Fallback categories when API is unavailable
const fallbackCategories = [
  { id: "fb-1", name: "T-Shirts", description: "Premium cotton and blended tees for everyday style" },
  { id: "fb-2", name: "Promotional T-Shirts", description: "Custom branded apparel for events, campaigns & giveaways" },
  { id: "fb-3", name: "Sublimation T-Shirts", description: "Vibrant all-over prints with cutting-edge sublimation tech" },
  { id: "fb-4", name: "Uniforms", description: "Professional uniforms for corporates, schools & institutions" },
  { id: "fb-5", name: "Tracks & Tracksuits", description: "Sporty tracks, joggers & complete tracksuits for active life" },
];

// Fallback reviews when API is unavailable
const fallbackReviews = [
  { id: "fr-1", name: "Rajesh K.", role: "Event Manager", rating: 5, text: "KPJ delivered 500 custom tees for our corporate event in just 3 days. The quality and print were outstanding.", created_at: new Date().toISOString() },
  { id: "fr-2", name: "Priya M.", role: "School Principal", rating: 5, text: "We have been ordering school uniforms from KPJ for 2 years. Consistent quality and great pricing every time.", created_at: new Date().toISOString() },
  { id: "fr-3", name: "Anil S.", role: "Gym Owner", rating: 5, text: "The sublimation jerseys for our gym are incredible. Vibrant colors that do not fade even after months of washing.", created_at: new Date().toISOString() },
  { id: "fr-4", name: "Sneha R.", role: "Marketing Head", rating: 5, text: "Our promotional campaign tees were a huge hit. KPJ team helped us with design and delivered on time.", created_at: new Date().toISOString() },
];

// ─── Home Component ───
const Home = () => {
  const [metrics, setMetrics] = useState(getMetrics());
  const [categories, setCategories] = useState(fallbackCategories);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState(fallbackReviews);
  const [reviewForm, setReviewForm] = useState({ name: "", role: "", rating: 5, text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch((err) => console.warn("Metrics fetch failed:", err.message));

    getCategories().then(cats => {
      if (!Array.isArray(cats) || cats.length === 0) return;
      const topLevel = cats.filter(c => !c.parent_id);
      if (topLevel.length > 0) setCategories(topLevel);
    }).catch((err) => console.warn("Categories fetch failed, using fallback:", err.message));

    getProducts().then(prods => {
      if (Array.isArray(prods)) setProducts(prods);
    }).catch((err) => console.warn("Products fetch failed:", err.message));

    getReviews().then(revs => {
      if (Array.isArray(revs) && revs.length > 0) setReviews(revs);
    }).catch((err) => console.warn("Reviews fetch failed, using fallback:", err.message));
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      setSnack({ open: true, msg: "Please fill in your name and review", severity: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const newReview = await submitReview(reviewForm);
      if (newReview && newReview.id) {
        setReviews(prev => [newReview, ...prev]);
        setReviewForm({ name: "", role: "", rating: 5, text: "" });
        setSnack({ open: true, msg: "Thank you for your review!", severity: "success" });
      } else {
        console.warn("Review submit returned unexpected data:", newReview);
        setSnack({ open: true, msg: "Review submitted but may take a moment to appear.", severity: "info" });
        setReviewForm({ name: "", role: "", rating: 5, text: "" });
      }
    } catch (err) {
      console.warn("Review submit failed:", err.message);
      setSnack({ open: true, msg: "Could not submit review right now. Please try again later.", severity: "error" });
    }
    setSubmitting(false);
  };

  // Stats with counter animation
  const stats = [
    { value: metrics.tshirtsDelivered > 0 ? metrics.tshirtsDelivered : 50000, label: "T-Shirts Delivered", suffix: "+" },
    { value: metrics.happyClients > 0 ? metrics.happyClients : 500, label: "Happy Clients", suffix: "+" },
    { value: metrics.expressDelivery || "48hr", label: "Express Delivery" },
    { value: metrics.satisfactionRate || "100%", label: "Satisfaction Rate" },
  ];

  // Products grouped by category for display — safe against non-array
  const productsByCategory = {};
  const safeProducts = Array.isArray(products) ? products : [];
  safeProducts.forEach(p => {
    const cat = p.category || "Other";
    if (!productsByCategory[cat]) productsByCategory[cat] = [];
    productsByCategory[cat].push(p);
  });

  // Top reviews: highest rated first, then most recent — safe against non-array
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const sortedReviews = [...safeReviews].sort((a, b) => (b.rating || 0) - (a.rating || 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <SEO
        title="Custom Printed T-Shirts, Uniforms & Garments"
        description="KPJ Garments Visakhapatnam — custom printed t-shirts, school & college uniforms, corporate workwear, sublimation printing, DTF printing, tracks & shorts. Bulk orders, fast delivery, no minimums."
        path="/"
        keywords="KPJ, KPJ T-Shirts, custom t-shirts Visakhapatnam, uniforms in Visakhapatnam, school uniforms Vizag, college uniforms, sublimation printing, DTF printing, screen printing, bulk t-shirts, promotional t-shirts, MBA batch tees, tracks shorts, corporate uniforms, custom printed garments Visakhapatnam"
      />

      {/* ═══ HERO SECTION ═══ */}
      <Box sx={{
        minHeight: { xs: "75vh", md: "92vh" }, display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0f2439 0%, #1E3A5F 40%, #1a4a6e 100%)",
        py: { xs: 6, md: 0 },
      }}>
        {/* Animated background pattern */}
        <Box sx={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center",
        }} />
        {/* Floating gradient orbs */}
        <Box component={motion.div} animate={{ y: [0, -20, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          sx={{ position: "absolute", top: "10%", right: "15%", width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(51,147,224,0.3), transparent 70%)", filter: "blur(40px)" }} />
        <Box component={motion.div} animate={{ y: [0, 15, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          sx={{ position: "absolute", bottom: "15%", left: "10%", width: 250, height: 250, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,166,35,0.25), transparent 70%)", filter: "blur(40px)" }} />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <Chip label="🧵 Custom Printed Garments & Uniforms"
                  sx={{ mb: { xs: 2, md: 3 }, bgcolor: "rgba(245,166,35,0.12)", color: "#F5A623",
                    fontWeight: 600, fontSize: { xs: 11, md: 13 }, border: "1px solid rgba(245,166,35,0.2)" }} />
                <Typography variant="h1" sx={{
                  color: "#fff", fontSize: { xs: "1.9rem", sm: "2.4rem", md: "3.2rem", lg: "3.8rem" },
                  lineHeight: 1.12, mb: { xs: 2, md: 3 },
                }}>
                  Custom Apparel for<br />
                  <Box component={motion.span} animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    sx={{ background: "linear-gradient(90deg, #3393E0, #F5A623, #3393E0)", backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Schools, Colleges & Pros
                  </Box>
                </Typography>
                <Typography variant="h6" sx={{
                  color: "rgba(255,255,255,0.65)", fontWeight: 400, mb: { xs: 3, md: 4 },
                  maxWidth: 540, lineHeight: 1.7, fontSize: { xs: "0.88rem", sm: "1rem", md: "1.1rem" },
                }}>
                  From school uniforms to MBA batch tees, corporate polos to sports tracksuits — premium custom printed garments with fast delivery and no minimums.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button component={Link} to="/products/tshirts" variant="contained" size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: "linear-gradient(135deg, #F5A623, #e8941a)", color: "#1E3A5F", fontWeight: 700,
                      px: { xs: 3, md: 4 }, py: 1.5, fontSize: { xs: 14, md: 16 },
                      boxShadow: "0 4px 20px rgba(245,166,35,0.3)",
                      "&:hover": { boxShadow: "0 6px 30px rgba(245,166,35,0.45)", transform: "translateY(-2px)" },
                      transition: "all 0.3s ease",
                    }}>
                    Explore Products
                  </Button>
                  <Button component={Link} to="/quote" variant="outlined" size="large"
                    sx={{
                      borderColor: "rgba(255,255,255,0.25)", color: "#fff",
                      px: { xs: 3, md: 4 }, py: 1.5, fontSize: { xs: 14, md: 16 },
                      "&:hover": { borderColor: "#3393E0", bgcolor: "rgba(51,147,224,0.08)" },
                    }}>
                    Get a Quote
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
              <motion.div initial={{ opacity: 0, scale: 0.85, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}>
                <Box sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
                  <img src={heroImg} alt="Custom printed garments" style={{ width: "100%", maxWidth: 480, display: "block" }} />
                  <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,36,57,0.4), transparent 50%)" }} />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══ STATS BAR WITH COUNTER ANIMATION ═══ */}
      <Box sx={{ background: "linear-gradient(135deg, #3393E0 0%, #1a6fb5 100%)", py: { xs: 3.5, md: 5 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
            {stats.map((s) => (
              <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
                <AnimatedStat value={s.value} label={s.label} suffix={s.suffix || ""} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══ WHAT WE DO — FOCUS AREAS ═══ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#fff" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 7 } }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
              <Chip label="What We Specialize In" sx={{ mb: 2, bgcolor: "rgba(51,147,224,0.08)", color: "#3393E0", fontWeight: 600 }} />
              <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#1E3A5F", mb: 1.5 }}>
                Custom Garments for <Box component="span" sx={{ color: "#3393E0" }}>Every Need</Box>
              </Typography>
              <Typography variant="body1" sx={{ color: "#5A6F8A", maxWidth: 600, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
                Whether it's a school batch, college fest, corporate team, or sports club — we print, stitch, and deliver.
              </Typography>
            </motion.div>
          </Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {showcaseItems.map((item, i) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                  custom={i} variants={fadeUp}>
                  <Box sx={{
                    p: { xs: 2.5, md: 3.5 }, borderRadius: 3, height: "100%",
                    border: "1px solid rgba(51,147,224,0.08)", bgcolor: "#F8FBFF",
                    transition: "all 0.35s ease",
                    "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 40px rgba(51,147,224,0.12)",
                      borderColor: "rgba(51,147,224,0.2)" },
                  }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: `${item.color}15`, color: item.color, mb: 2, "& svg": { fontSize: 26 } }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: 15, md: 17 }, color: "#1E3A5F", mb: 1 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#5A6F8A", lineHeight: 1.7, fontSize: { xs: 13, md: 14 } }}>{item.desc}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══ PRODUCT CATEGORIES FROM API ═══ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#F8FBFF" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 7 } }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#1E3A5F", mb: 1.5 }}>
                Our Product Range
              </Typography>
              <Typography variant="body1" sx={{ color: "#5A6F8A", maxWidth: 600, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
                Everything you need under one roof — from casual tees to professional uniforms
              </Typography>
            </motion.div>
          </Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {categories.map((cat, i) => {
              const img = getCategoryImage(cat.name);
              const slug = getCategorySlug(cat.name);
              const productCount = productsByCategory[cat.name]?.length || 0;
              return (
                <Grid key={cat.id} size={{ xs: 6, sm: 6, md: i < 2 ? 6 : 4 }}>
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                    custom={i} variants={fadeUp}>
                    <Card component={Link} to={`/products/${slug}`}
                      sx={{
                        textDecoration: "none", position: "relative", overflow: "hidden",
                        borderRadius: { xs: 2, md: 3 },
                        height: { xs: 170, sm: 210, md: i < 2 ? 320 : 260 },
                        cursor: "pointer",
                        "&:hover img": { transform: "scale(1.08)" },
                        "&:hover .cat-overlay": { background: "rgba(10,22,40,0.55)" },
                        "&:hover .cat-arrow": { opacity: 1, transform: "translateX(0)" },
                      }}>
                      <CardMedia component="img" image={img} alt={cat.name}
                        sx={{ height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }} />
                      <Box className="cat-overlay" sx={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.2) 60%, transparent 100%)",
                        transition: "background 0.4s",
                        display: "flex", flexDirection: "column", justifyContent: "flex-end",
                        p: { xs: 1.5, sm: 2, md: 3 },
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h5" sx={{ color: "#fff", fontSize: { xs: 14, sm: 16, md: 22 }, flex: 1 }}>
                            {cat.name}
                          </Typography>
                          <Box className="cat-arrow" sx={{ opacity: 0, transform: "translateX(-10px)", transition: "all 0.3s ease" }}>
                            <ArrowForwardIcon sx={{ color: "#F5A623", fontSize: 20 }} />
                          </Box>
                        </Box>
                        {cat.description && (
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", display: { xs: "none", sm: "block" }, fontSize: { sm: 12, md: 14 }, mt: 0.5 }}>
                            {cat.description}
                          </Typography>
                        )}
                        {productCount > 0 && (
                          <Chip label={`${productCount} products`} size="small"
                            sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 11, height: 22, width: "fit-content" }} />
                        )}
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ═══ WHY CHOOSE KPJ ═══ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#fff" }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={slideLeft}>
                <Chip label="Why KPJ" sx={{ mb: 2, bgcolor: "rgba(245,166,35,0.1)", color: "#F5A623", fontWeight: 600 }} />
                <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#1E3A5F", mb: { xs: 2.5, md: 3.5 } }}>
                  Quality That <Box component="span" sx={{ color: "#3393E0" }}>Speaks</Box>
                </Typography>
                <Stack spacing={{ xs: 2.5, md: 3 }}>
                  {[
                    { icon: <CheckCircleIcon />, title: "Premium Quality", desc: "Only the finest fabrics and inks for prints that last wash after wash", color: "#3393E0" },
                    { icon: <BrushIcon />, title: "Custom Designs", desc: "Sublimation, DTF, screen printing, embroidery — we do it all", color: "#F5A623" },
                    { icon: <LocalShippingIcon />, title: "Express Delivery", desc: "48-hour turnaround on most orders, pan-India shipping", color: "#3393E0" },
                    { icon: <GroupsIcon />, title: "No Minimums", desc: "Single piece or 10,000 — same quality, same care, same pricing", color: "#F5A623" },
                  ].map((item, i) => (
                    <motion.div key={item.title} initial="hidden" whileInView="visible"
                      viewport={{ once: true }} custom={i} variants={fadeUp}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start",
                        p: 2, borderRadius: 2, transition: "all 0.3s",
                        "&:hover": { bgcolor: "#F8FBFF", transform: "translateX(4px)" } }}>
                        <Box sx={{ mt: 0.3, color: item.color, "& svg": { fontSize: 24 } }}>{item.icon}</Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontSize: { xs: 15, md: 17 }, color: "#1E3A5F", mb: 0.3 }}>{item.title}</Typography>
                          <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: { xs: 13, md: 14 }, lineHeight: 1.6 }}>{item.desc}</Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={slideRight}>
                <Box sx={{ borderRadius: { xs: 3, md: 4 }, overflow: "hidden",
                  boxShadow: "0 16px 50px rgba(0,0,0,0.1)", position: "relative" }}>
                  <img src={whyQuality} alt="Premium quality garments" style={{ width: "100%", display: "block" }} />
                  <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 2, md: 3 },
                    background: "linear-gradient(to top, rgba(30,58,95,0.9), transparent)" }}>
                    <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600, fontSize: { xs: 13, md: 15 } }}>
                      ✨ Trusted by 500+ businesses across India
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══ REVIEWS SECTION ═══ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#0f2439" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
              <Chip label="Customer Reviews" sx={{ mb: 2, bgcolor: "rgba(245,166,35,0.12)", color: "#F5A623", fontWeight: 600 }} />
              <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.5rem" }, color: "#fff", mb: 1 }}>
                What Our Clients Say
              </Typography>
            </motion.div>
          </Box>

          {/* Top Reviews */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
            {sortedReviews.slice(0, 4).map((r, i) => (
              <Grid key={r.id || i} size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-30px" }}
                  custom={i} variants={fadeUp}>
                  <Box sx={{
                    bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 3, p: { xs: 2.5, md: 3 }, height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.07)", transform: "translateY(-4px)",
                      borderColor: "rgba(51,147,224,0.3)" },
                  }}>
                    <FormatQuoteIcon sx={{ color: "rgba(51,147,224,0.3)", fontSize: 28, mb: 1 }} />
                    <Stack direction="row" spacing={0.3} sx={{ mb: 1.5 }}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <StarIcon key={si} sx={{ color: si < r.rating ? "#F5A623" : "rgba(255,255,255,0.15)", fontSize: { xs: 16, md: 18 } }} />
                      ))}
                    </Stack>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)", mb: 2, lineHeight: 1.7, fontSize: { xs: 13, md: 14 },
                      display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      "{r.text}"
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: "#3393E0", width: 34, height: 34, fontSize: 14 }}>{r.name?.[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{r.name}</Typography>
                        {r.role && <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>{r.role}</Typography>}
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Write a Review Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={scaleIn}>
            <Box sx={{
              maxWidth: 680, mx: "auto", p: { xs: 3, md: 4 }, borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <Typography variant="h5" sx={{ color: "#fff", mb: 0.5, fontSize: { xs: 18, md: 22 }, textAlign: "center" }}>
                Share Your Experience
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 3, textAlign: "center", fontSize: 13 }}>
                Your feedback helps us improve and helps others make informed decisions
              </Typography>
              <Box component="form" onSubmit={handleReviewSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth size="small" placeholder="Your Name *" value={reviewForm.name}
                      onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        "&.Mui-focused fieldset": { borderColor: "#3393E0" } },
                        "& input::placeholder": { color: "rgba(255,255,255,0.4)" } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth size="small" placeholder="Your Role (e.g. Student, Manager)" value={reviewForm.role}
                      onChange={e => setReviewForm(p => ({ ...p, role: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        "&.Mui-focused fieldset": { borderColor: "#3393E0" } },
                        "& input::placeholder": { color: "rgba(255,255,255,0.4)" } }} />
                  </Grid>
                  <Grid size={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Rating:</Typography>
                      <Rating value={reviewForm.rating} onChange={(_, v) => setReviewForm(p => ({ ...p, rating: v || 5 }))}
                        sx={{ "& .MuiRating-iconFilled": { color: "#F5A623" }, "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.2)" } }} />
                    </Box>
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth multiline rows={3} placeholder="Write your review... *" value={reviewForm.text}
                      onChange={e => setReviewForm(p => ({ ...p, text: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        "&.Mui-focused fieldset": { borderColor: "#3393E0" } },
                        "& textarea::placeholder": { color: "rgba(255,255,255,0.4)" } }} />
                  </Grid>
                  <Grid size={12} sx={{ textAlign: "center" }}>
                    <Button type="submit" variant="contained" disabled={submitting}
                      endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                      sx={{ background: "linear-gradient(135deg, #F5A623, #e8941a)", color: "#1E3A5F",
                        fontWeight: 700, px: 4, py: 1.2, "&:hover": { boxShadow: "0 4px 20px rgba(245,166,35,0.3)" } }}>
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ═══ CTA SECTION ═══ */}
      <Box sx={{ py: { xs: 6, md: 9 }, background: "linear-gradient(135deg, #3393E0 0%, #1a6fb5 100%)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Box component={motion.div} animate={{ rotate: [0, 360] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          sx={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)" }} />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
            <Typography variant="h3" sx={{ color: "#fff", fontSize: { xs: "1.3rem", sm: "1.6rem", md: "2.2rem" }, mb: 2 }}>
              Ready to Create Your Custom Apparel?
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", mb: { xs: 3, md: 4 }, maxWidth: 520, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
              Get in touch today for a free quote. No minimums, fast delivery, premium quality guaranteed.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ px: { xs: 2, sm: 0 } }}>
              <Button component={Link} to="/contact" variant="contained" size="large"
                sx={{ background: "#F5A623", color: "#1E3A5F", fontWeight: 700, px: { xs: 3, md: 5 },
                  boxShadow: "0 4px 20px rgba(245,166,35,0.3)",
                  "&:hover": { background: "#e8941a", boxShadow: "0 6px 30px rgba(245,166,35,0.4)" } }}>
                Contact Us
              </Button>
              <Button href="https://wa.me/918143670894" target="_blank" variant="outlined" size="large"
                sx={{ borderColor: "#fff", color: "#fff", px: { xs: 3, md: 5 },
                  "&:hover": { borderColor: "#F5A623", bgcolor: "rgba(255,255,255,0.08)" } }}>
                WhatsApp Us
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Snackbar for review submission */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
