import React from "react";
import { Box, Container, Typography, Grid, Button, Stack, IconButton, Paper } from "@mui/material";
import { motion } from "framer-motion";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DownloadIcon from "@mui/icons-material/Download";
import QRCode from "react-qr-code";
import kpjLogo from "../assets/kpjLogo.svg";
import QuoteForm from "../components/QuoteForm";
import SEO from "../components/SEO";

const contact = {
  name: "KPJ Garments",
  phone: "+918074175884",
  phone2: "+918555909245",
  whatsapp: "+918143670894",
  email: "support@kpj.app",
  instagram: "kpj_tshirts",
  location: "IT Sez Rushikonda, Visakhapatnam",
};

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const Contact = () => {
  const handleVCardDownload = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.name}\nTEL;TYPE=CELL:${contact.phone}\nTEL;TYPE=CELL:${contact.phone2}\nEMAIL:${contact.email}\nNOTE:Instagram: @${contact.instagram}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "KPJ_Garments.vcf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <SEO
        title="Contact Us — Get a Free Quote"
        description="Contact KPJ Garments Visakhapatnam for custom t-shirts, uniforms, sublimation printing. Call +91 80741 75884 or WhatsApp. IT SEZ Rushikonda, Visakhapatnam."
        path="/contact"
        keywords="KPJ contact, custom t-shirts Visakhapatnam phone, t-shirt printing near me, KPJ Garments address, Vizag garments shop, bulk order enquiry"
      />
      {/* Hero */}
      <Box sx={{ py: { xs: 5, md: 8 }, background: "linear-gradient(135deg, #1E3A5F, #122a4a)", textAlign: "center" }}>
        <Container maxWidth="md">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Typography variant="h2" sx={{ color: "#fff", fontSize: { xs: "1.6rem", sm: "2rem", md: "2.8rem" }, mb: 2 }}>
              Let's Create Something <Box component="span" sx={{ color: "#F5A623" }}>Amazing</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 500, mx: "auto", fontSize: { xs: 14, md: 16 } }}>
              Reach out for custom orders, bulk quotes, or just to say hello. We respond within hours.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 3, md: 8 }, bgcolor: "#F8FBFF" }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Quote Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <QuoteForm />
              </motion.div>
            </Grid>

            {/* Contact Info */}
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Stack spacing={{ xs: 2, md: 3 }}>
                  <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: { xs: 2, md: 3 }, border: "1px solid #E2E8F0", boxShadow: "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                      <img src={kpjLogo} alt="KPJ" style={{ height: 36, background: "rgba(51,147,224,0.1)", borderRadius: 10, padding: 6 }} />
                      <Box>
                        <Typography variant="h6" sx={{ color: "#1E3A5F", fontSize: { xs: 16, md: 18 } }}>KPJ Garments</Typography>
                        <Typography variant="caption" sx={{ color: "#4A5568" }}>Custom Apparel Experts</Typography>
                      </Box>
                    </Box>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <PhoneIcon sx={{ color: "#3393E0", fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontSize: { xs: 13, md: 14 } }}>
                          <a href={`tel:${contact.phone}`} style={{ color: "#1E3A5F", textDecoration: "none" }}>+91 80741 75884</a>
                          {" / "}
                          <a href={`tel:${contact.phone2}`} style={{ color: "#1E3A5F", textDecoration: "none" }}>85559 09245</a>
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <EmailIcon sx={{ color: "#3393E0", fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontSize: { xs: 13, md: 14 } }}>
                          <a href={`mailto:${contact.email}`} style={{ color: "#1E3A5F", textDecoration: "none" }}>{contact.email}</a>
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <LocationOnIcon sx={{ color: "#3393E0", fontSize: 20, mt: 0.2 }} />
                        <Typography variant="body2" sx={{ color: "#1E3A5F", fontSize: { xs: 13, md: 14 } }}>{contact.location}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                      <IconButton href={`https://wa.me/${contact.whatsapp.replace("+", "")}`} target="_blank"
                        sx={{ bgcolor: "rgba(37,211,102,0.1)", color: "#25D366", "&:hover": { bgcolor: "rgba(37,211,102,0.2)" } }}>
                        <WhatsAppIcon />
                      </IconButton>
                      <IconButton href={`https://instagram.com/${contact.instagram}`} target="_blank"
                        sx={{ bgcolor: "rgba(228,64,95,0.1)", color: "#E4405F", "&:hover": { bgcolor: "rgba(228,64,95,0.2)" } }}>
                        <InstagramIcon />
                      </IconButton>
                      <IconButton href={`mailto:${contact.email}`}
                        sx={{ bgcolor: "rgba(51,147,224,0.1)", color: "#3393E0", "&:hover": { bgcolor: "rgba(51,147,224,0.2)" } }}>
                        <EmailIcon />
                      </IconButton>
                    </Stack>
                  </Paper>

                  {/* QR & vCard */}
                  <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: { xs: 2, md: 3 }, border: "1px solid #E2E8F0", boxShadow: "none", textAlign: "center" }}>
                    <Typography variant="subtitle2" sx={{ color: "#4A5568", mb: 2, fontSize: { xs: 13, md: 14 } }}>Scan to save contact</Typography>
                    <QRCode
                      value={`MECARD:N:${contact.name};TEL:${contact.phone};EMAIL:${contact.email};NOTE:${contact.instagram};;`}
                      size={100}
                      style={{ background: "#fff", padding: 8, borderRadius: 8 }}
                    />
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleVCardDownload} fullWidth
                      sx={{ mt: 2, borderColor: "#3393E0", color: "#3393E0", fontWeight: 600, "&:hover": { bgcolor: "rgba(51,147,224,0.05)" } }}>
                      Download vCard
                    </Button>
                  </Paper>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Contact;
