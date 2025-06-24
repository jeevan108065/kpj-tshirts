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
import { getRandomTshirts } from "../components/BusinessCard"; // Import the function

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
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        py: { xs: 1, sm: 4 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,rgb(253, 253, 253) 0%,rgb(149, 207, 255) 100%)",
      }}
    >
      {/* Background T-shirt icons */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {getRandomTshirts(20)}
      </Box>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={false}
        transition={{ duration: 0.7, type: "spring", bounce: 0.25 }}
        style={{
          width: "100%",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 400,
            width: "100%",
            mx: "auto",
            p: { xs: 2, sm: 4 },
            borderRadius: 6,
            position: "relative",
            zIndex: 2,
            overflow: "hidden",
            // Toughened glass effect
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.22) 60%, rgba(200,220,255,0.13) 100%)",
            border: "2.5px solid rgba(255,255,255,0.45)",
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(0,0,0,0.08)",
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
            "&:before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: 6,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.10) 60%, transparent 100%)",
              zIndex: 1,
            },
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: 6,
              pointerEvents: "none",
              boxShadow:
                "inset 0 1.5px 8px 0 rgba(255,255,255,0.18), inset 0 -2px 12px 0 rgba(0,0,0,0.07)",
              zIndex: 2,
            },
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            mb={2}
            sx={{ position: "relative", zIndex: 3 }}
          >
            <img
              src={kpjLogo}
              alt="KPJ Logo"
              style={{
                height: "clamp(40px, 10vw, 70px)",
                borderRadius: 12,
                padding: 8,
                maxWidth: "100%",
                background: "rgba(101, 206, 255, 0.7)",
                boxShadow: "0 2px 12px #3393e033",
                border: "1.5px solid rgba(255,255,255,0.35)",
                backdropFilter: "blur(2px)",
              }}
            />
          </Box>
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            sx={{
              fontSize: { xs: 22, sm: 28 },
              color: "#22223b",
              letterSpacing: 1,
              textShadow: "0 1px 8px #fff8",
              position: "relative",
              zIndex: 3,
            }}
          >
            KPJ Tshirts
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: { xs: 14, sm: 16 },
              color: "#4a4e69",
              mb: 1,
              position: "relative",
              zIndex: 3,
            }}
          >
            A to Z T shirt needs | {contact.location}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ my: 2, position: "relative", zIndex: 3 }}
          >
            <PhoneIcon color="primary" />
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                fontSize: { xs: 14, sm: 16 },
                color: "#22223b",
                wordBreak: "break-all",
              }}
            >
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
            sx={{ mb: 2, position: "relative", zIndex: 3 }}
          >
            <IconButton
              color="success"
              href={`https://wa.me/${contact.whatsapp.replace("+", "")}`}
              target="_blank"
              rel="noopener"
              sx={{
                bgcolor: "white",
                boxShadow: 1,
                "&:hover": { bgcolor: "#e0ffe0" },
              }}
            >
              <WhatsAppIcon />
            </IconButton>
            <IconButton
              color="primary"
              href={`mailto:${contact.email}`}
              sx={{
                bgcolor: "white",
                boxShadow: 1,
                "&:hover": { bgcolor: "#e0eaff" },
              }}
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
              sx={{
                bgcolor: "white",
                boxShadow: 1,
                "&:hover": { bgcolor: "#ffe0fa" },
              }}
            >
              <InstagramIcon />
            </IconButton>
          </Stack>
          <Box
            sx={{
              my: 3,
              display: "flex",
              justifyContent: "center",
              position: "relative",
              zIndex: 3,
            }}
          >
            <QRCode
              value={`MECARD:N:${contact.name};TEL:${contact.phone};EMAIL:${contact.email};NOTE:${contact.instagram};;`}
              size={120}
              style={{
                background: "white",
                padding: 8,
                borderRadius: 8,
                width: "100%",
                maxWidth: 140,
                boxShadow: "0 2px 8px #22223b22",
              }}
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
              mt: 1,
              mb: 0.5,
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(90deg, #dd2476 0%, #ff512f 100%)",
              },
              position: "relative",
              zIndex: 3,
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
