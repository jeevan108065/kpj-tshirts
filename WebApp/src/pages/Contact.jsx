import { Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';

const contact = {
  name: "KPJ Tshirts",
  phone: "+918074175884",
  phone2: "+918555909245",
  email: "p7j6d7@gmail.com",
  instagram: "@kpj_tshirts",
};

function generateVCard({ name, phone, phone2, email, instagram }) {
  return (
    `BEGIN:VCARD\n` +
    `VERSION:3.0\n` +
    `FN:${name}\n` +
    `TEL;TYPE=CELL:${phone}\n` +
    (phone2 ? `TEL;TYPE=CELL:${phone2}\n` : '') +
    `EMAIL:${email}\n` +
    `NOTE:Instagram: ${instagram}\n` +
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '2rem' }}
    >
      <h2>Contact Me</h2>
      <p>Phone: {contact.phone} / {contact.phone2}</p>
      <p>Email: {contact.email}</p>
      <p>Instagram: {contact.instagram}</p>
      <Box sx={{ my: 2 }}>
        <QRCode
          value={`MECARD:N:${contact.name};TEL:${contact.phone};EMAIL:${contact.email};NOTE:${contact.instagram};;`}
          size={128}
        />
      </Box>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleVCardDownload}
      >
        Download vCard
      </Button>
    </motion.div>
  );
};

export default Contact;
