import React, { useState } from "react";
import {
  Typography, Button, Stack, TextField, MenuItem, Paper, Snackbar, Alert,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";

const productOptions = [
  "T-Shirts", "Promotional T-Shirts", "Sublimation T-Shirts",
  "Uniforms", "Tracks & Tracksuits", "Other / Custom",
];

const CONTACT = {
  whatsapp: "918143670894",
  email: "support@kpj.app",
};

const QuoteForm = ({ prefilledProduct = "", compact = false }) => {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", product: prefilledProduct, quantity: "", message: "",
  });
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const buildMessage = () => {
    const lines = [
      `Quote Request from ${form.name || "Customer"}`,
      `Phone: ${form.phone || "N/A"}`,
      form.email ? `Email: ${form.email}` : "",
      `Product: ${form.product || "Not specified"}`,
      form.quantity ? `Quantity: ${form.quantity}` : "",
      "",
      form.message || "I'd like to request a quote for your products.",
    ];
    return lines.filter(Boolean).join("\n");
  };

  const handleWhatsApp = () => {
    const text = buildMessage();
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Quote Request - ${form.product || "KPJ Products"}`);
    const body = encodeURIComponent(buildMessage());
    window.open(`mailto:${CONTACT.email}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  };

  const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };

  return (
    <Paper sx={{
      p: { xs: 2.5, sm: 3, md: compact ? 3 : 4 }, borderRadius: { xs: 2, md: 3 },
      border: "1px solid #E2E8F0", boxShadow: "none",
    }}>
      <Typography variant="h5" sx={{ color: "#1E3A5F", mb: 0.5, fontSize: { xs: compact ? 18 : 20, md: compact ? 20 : 24 } }}>
        Request a Quote
      </Typography>
      <Typography variant="body2" sx={{ color: "#4A5568", mb: { xs: 2, md: 3 }, fontSize: { xs: 13, md: 14 } }}>
        Fill in your details and reach us via WhatsApp or Email
      </Typography>

      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField label="Your Name" fullWidth value={form.name} onChange={update("name")} sx={inputSx} size={compact ? "small" : "medium"} />
          <TextField label="Phone Number" fullWidth value={form.phone} onChange={update("phone")} sx={inputSx} size={compact ? "small" : "medium"} />
        </Stack>

        <TextField label="Email (optional)" fullWidth value={form.email} onChange={update("email")} sx={inputSx} size={compact ? "small" : "medium"} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField label="Product Category" select fullWidth value={form.product} onChange={update("product")} sx={inputSx} size={compact ? "small" : "medium"}>
            {productOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <TextField label="Quantity" fullWidth value={form.quantity} onChange={update("quantity")} placeholder="e.g. 50 pieces" sx={inputSx} size={compact ? "small" : "medium"} />
        </Stack>

        <TextField label="Your Requirements" fullWidth multiline rows={compact ? 3 : 4} value={form.message} onChange={update("message")}
          placeholder="Tell us about your design, colors, sizes, timeline..." sx={inputSx} size={compact ? "small" : "medium"} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="contained" size="large" fullWidth startIcon={<WhatsAppIcon />} onClick={handleWhatsApp}
            sx={{ background: "#25D366", color: "#fff", fontWeight: 700, py: 1.5, fontSize: { xs: 14, md: 16 }, "&:hover": { background: "#1da851" } }}>
            Send via WhatsApp
          </Button>
          <Button variant="contained" size="large" fullWidth startIcon={<EmailIcon />} onClick={handleEmail}
            sx={{ background: "linear-gradient(135deg, #3393E0, #1a6fb5)", color: "#fff", fontWeight: 700, py: 1.5, fontSize: { xs: 14, md: 16 }, "&:hover": { background: "#1a6fb5" } }}>
            Send via Email
          </Button>
        </Stack>
      </Stack>

      <Snackbar open={sent} autoHideDuration={4000} onClose={() => setSent(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSent(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
          Your quote request has been opened. Please send the message to complete it.
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default QuoteForm;
