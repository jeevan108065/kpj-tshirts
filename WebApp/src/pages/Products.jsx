import React from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Chip, Button, Breadcrumbs, Stack } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import { categories, products } from "../data/products";
import SEO from "../components/SEO";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const tagColors = {
  Bestseller: "#F5A623", Premium: "#3393E0", Popular: "#10B981", New: "#8B5CF6",
  Trending: "#EC4899", "Bulk Deal": "#F59E0B", Corporate: "#1E3A5F", Art: "#8B5CF6",
  Cultural: "#D97706", Sports: "#059669", Education: "#3B82F6", Healthcare: "#06B6D4",
  Hospitality: "#F97316", Security: "#6B7280", Industrial: "#78716C", Custom: "#7C3AED",
  Seasonal: "#2563EB",
};

const Products = () => {
  const { categoryId } = useParams();
  const category = categories.find((c) => c.id === categoryId);
  const items = products[categoryId] || [];

  if (!category) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Category not found</Typography>
        <Button component={Link} to="/" variant="contained">Go Home</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <SEO
        title={`${category.name} — Custom Printed ${category.name} in Visakhapatnam`}
        description={`Buy custom ${category.name.toLowerCase()} in Visakhapatnam. ${category.description}. Sublimation, DTF, screen printing. Bulk orders welcome. Fast delivery by KPJ Garments.`}
        path={`/products/${categoryId}`}
        keywords={`${category.name} Visakhapatnam, custom ${category.name.toLowerCase()}, ${category.name.toLowerCase()} printing, bulk ${category.name.toLowerCase()}, KPJ ${category.name.toLowerCase()}`}
      />
      {/* Hero Banner */}
      <Box sx={{
        position: "relative", height: { xs: 200, sm: 260, md: 360 }, overflow: "hidden",
        background: `linear-gradient(135deg, rgba(10,22,40,0.85), rgba(10,22,40,0.6)), url(${category.hero}) center/cover`,
        display: "flex", alignItems: "center",
      }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Breadcrumbs sx={{ mb: 1.5, "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.5)" } }}>
              <Typography component={Link} to="/" sx={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: { xs: 13, md: 16 }, "&:hover": { color: "#F5A623" } }}>
                Home
              </Typography>
              <Typography sx={{ color: "#F5A623", fontSize: { xs: 13, md: 16 } }}>{category.name}</Typography>
            </Breadcrumbs>
            <Typography variant="h2" sx={{ color: "#fff", fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" }, mb: 1 }}>
              {category.name}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 400, maxWidth: 500, fontSize: { xs: 13, sm: 14, md: 18 } }}>
              {category.description}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Products Grid */}
      <Box sx={{ py: { xs: 3, md: 8 }, bgcolor: "#F8FBFF" }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {items.map((item, i) => (
              <Grid key={item.name} size={{ xs: 6, sm: 6, md: 4 }}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  style={{ transitionDelay: `${i * 0.1}s` }}>
                  <Card sx={{
                    borderRadius: { xs: 2, md: 3 }, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "none",
                    transition: "all 0.3s", "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.1)", transform: "translateY(-4px)" },
                    "&:hover img": { transform: "scale(1.05)" }, height: "100%", display: "flex", flexDirection: "column",
                  }}>
                    <Box sx={{ position: "relative", overflow: "hidden" }}>
                      <CardMedia component="img" image={item.image} alt={item.name}
                        sx={{ height: { xs: 140, sm: 180, md: 220 }, objectFit: "cover", transition: "transform 0.5s ease" }} />
                      {item.tag && (
                        <Chip label={item.tag} size="small"
                          sx={{ position: "absolute", top: 8, left: 8, bgcolor: tagColors[item.tag] || "#3393E0", color: "#fff", fontWeight: 600, fontSize: { xs: 10, md: 12 } }} />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 1.5, md: 2 } }}>
                      <Typography variant="h6" sx={{ fontSize: { xs: 14, md: 18 }, color: "#1E3A5F", mb: 0.5 }}>{item.name}</Typography>
                      <Typography variant="body2" sx={{ color: "#4A5568", mb: 1.5, flexGrow: 1, fontSize: { xs: 12, md: 14 }, display: { xs: "-webkit-box" }, WebkitLineClamp: { xs: 2, md: 3 }, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.description}
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignSelf: "flex-start", width: "100%" }}>
                        <Button href={`https://wa.me/918143670894?text=Hi! I'm interested in ${item.name} from your ${category.name} collection.`}
                          target="_blank" variant="outlined" size="small" startIcon={<WhatsAppIcon />}
                          sx={{ borderColor: "#25D366", color: "#25D366", fontSize: { xs: 11, md: 13 }, px: { xs: 1, md: 2 }, "&:hover": { bgcolor: "rgba(37,211,102,0.08)", borderColor: "#25D366" } }}>
                          WhatsApp
                        </Button>
                        <Button href={`mailto:support@kpj.app?subject=${encodeURIComponent(`Quote: ${item.name}`)}&body=${encodeURIComponent(`Hi KPJ,\n\nI'm interested in "${item.name}" from your ${category.name} collection.\n\nPlease share pricing and details.\n\nThanks!`)}`}
                          variant="outlined" size="small" startIcon={<EmailIcon />}
                          sx={{ borderColor: "#3393E0", color: "#3393E0", fontSize: { xs: 11, md: 13 }, px: { xs: 1, md: 2 }, "&:hover": { bgcolor: "rgba(51,147,224,0.08)", borderColor: "#3393E0" } }}>
                          Email
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 4, md: 6 }, background: "linear-gradient(135deg, #1E3A5F, #122a4a)", textAlign: "center" }}>
        <Container maxWidth="sm">
          <Typography variant="h4" sx={{ color: "#fff", mb: 2, fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.8rem" } }}>
            Need Custom {category.name}?
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 3, fontSize: { xs: 13, md: 16 } }}>
            We offer custom designs, bulk orders, and express delivery. Let's create something amazing together.
          </Typography>
          <Button component={Link} to={`/quote?product=${encodeURIComponent(category.name)}`} variant="contained" size="large" endIcon={<ArrowForwardIcon />}
            sx={{ background: "linear-gradient(135deg, #F5A623, #e8941a)", color: "#1E3A5F", fontWeight: 700, px: { xs: 3, md: 4 } }}>
            Get a Free Quote
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Products;
