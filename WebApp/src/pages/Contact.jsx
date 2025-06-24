import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import kpjLogo from "../assets/kpjLogo.svg";

const contact = {
  name: "KPJ Tshirts",
  phone: "+918074175884",
  phone2: "+918555909245",
  whatsapp: "+918143670894",
  email: "p7j6d7@gmail.com",
  instagram: "kpj_tshirts",
  location: "IT Sez Rushikonda, Visakhapatnam",
};

function generateVCard({ name, phone, phone2, email, instagram }) {
  return (
    `BEGIN:VCARD\n` +
    `VERSION:3.0\n` +
    `FN:${name}\n` +
    `TEL;TYPE=CELL:${phone}\n` +
    (phone2 ? `TEL;TYPE=CELL:${phone2}\n` : "") +
    `EMAIL:${email}\n` +
    `NOTE:Instagram: @${instagram}\n` +
    `END:VCARD`
  );
}

const Contact = () => {
  const vCardString = generateVCard(contact);

  const handleVCardDownload = () => {
    const blob = new Blob([vCardString], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contact.name.replace(" ", "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: { xs: 1, sm: 4 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%" }}
      >
        <Paper
          elevation={8}
          sx={{
            maxWidth: 400,
            width: "100%",
            mx: "auto",
            p: { xs: 2, sm: 4 },
            borderRadius: 5,
            backdropFilter: "blur(12px) saturate(180%)",
            background: "#ACC1D2",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: 8,
            textAlign: "center",
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={kpjLogo}
              alt="KPJ Logo"
              style={{
                height: "clamp(40px, 10vw, 70px)",
                borderRadius: 12,
                padding: 8,
                maxWidth: "100%",
              }}
            />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: 22, sm: 28 } }}>
            KPJ Tshirts
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: 14, sm: 16 } }}>
            A to Z T shirt needs | {contact.location}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ my: 2 }}
          >
            <PhoneIcon color="primary" />
            <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: 14, sm: 16 } }}>
              <a
                href={`tel:${contact.phone}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {contact.phone}
              </a>
              {contact.phone2 && (
                <>
                  {" / "}
                  <a
                    href={`tel:${contact.phone2}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {contact.phone2}
                  </a>
                </>
              )}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            <IconButton
              color="success"
              href={`https://wa.me/${contact.whatsapp.replace("+", "")}`}
              target="_blank"
              rel="noopener"
              sx={{ bgcolor: "white", boxShadow: 1 }}
            >
              <WhatsAppIcon />
            </IconButton>
            <IconButton
              color="primary"
              href={`mailto:${contact.email}`}
              sx={{ bgcolor: "white", boxShadow: 1 }}
            >
              <EmailIcon />
            </IconButton>
            <IconButton
              color="secondary"
              href={`https://instagram.com/${contact.instagram.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noopener"
              sx={{ bgcolor: "white", boxShadow: 1 }}
            >
              <InstagramIcon />
            </IconButton>
          </Stack>
          <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
            <QRCode
              value={`MECARD:N:${contact.name};TEL:${contact.phone};EMAIL:${contact.email};NOTE:${contact.instagram};;`}
              size={120}
              style={{ background: "white", padding: 8, borderRadius: 8, width: "100%", maxWidth: 140 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleVCardDownload}
            fullWidth
            sx={{
              fontWeight: 600,
              letterSpacing: 1,
              borderRadius: 3,
              boxShadow: 2,
              background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
              fontSize: { xs: 14, sm: 16 },
              py: { xs: 1, sm: 2 },
            }}
          >
            Download vCard
          </Button>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Contact;
