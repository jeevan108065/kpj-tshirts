import React from "react";
import { Box, Container, Typography, Grid, Stack } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import QuoteForm from "../components/QuoteForm";
import SEO from "../components/SEO";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const Quote = () => {
  const [searchParams] = useSearchParams();
  const product = searchParams.get("product") || "";

  return (
    <Box sx={{ width: "100%" }}>
      <SEO
        title="Get a Free Quote — Custom T-Shirts & Uniforms"
        description="Request a free quote for custom t-shirts, uniforms, sublimation printing, DTF printing from KPJ Garments Visakhapatnam. No minimums, fast delivery."
        path="/quote"
        keywords="KPJ quote, custom t-shirt quote Visakhapatnam, bulk order quote, uniform quote Vizag, printing quote"
      />
      <Box sx={{ py: { xs: 5, md: 8 }, background: "linear-gradient(135deg, #1E3A5F, #122a4a)", textAlign: "center" }}>
        <Container maxWidth="md">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Typography variant="h2" sx={{ color: "#fff", fontSize: { xs: "1.6rem", sm: "2rem", md: "2.8rem" }, mb: 2 }}>
              Get a <Box component="span" sx={{ color: "#F5A623" }}>Free Quote</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 500, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
              Tell us what you need and we'll get back to you with the best pricing — via WhatsApp or Email.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 3, md: 8 }, bgcolor: "#F8FBFF" }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <QuoteForm prefilledProduct={product} />
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: { xs: 2, md: 3 }, bgcolor: "#fff", border: "1px solid #E2E8F0" }}>
                  <FormatQuoteIcon sx={{ color: "#3393E0", fontSize: { xs: 28, md: 36 }, mb: 1 }} />
                  <Typography variant="h6" sx={{ color: "#1E3A5F", mb: 2, fontSize: { xs: 16, md: 18 } }}>How it works</Typography>
                  <Stack spacing={2}>
                    {[
                      { step: "1", text: "Fill in your requirements and preferred product" },
                      { step: "2", text: "Choose to send via WhatsApp or Email" },
                      { step: "3", text: "Our team reviews and responds within hours" },
                      { step: "4", text: "Get your custom quote with best pricing" },
                    ].map((item) => (
                      <Box key={item.step} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                        <Box sx={{
                          minWidth: 28, height: 28, borderRadius: "50%", bgcolor: "#3393E0", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                        }}>
                          {item.step}
                        </Box>
                        <Typography variant="body2" sx={{ color: "#4A5568", pt: 0.3, fontSize: { xs: 13, md: 14 } }}>{item.text}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Quote;
