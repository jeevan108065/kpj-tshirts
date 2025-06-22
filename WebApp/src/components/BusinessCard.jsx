import { Card, CardContent, Typography, Avatar, Box, Button, IconButton, Stack } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import kpjLogo from '../assets/kpjLogo.svg';
import { GiTShirt } from 'react-icons/gi';

// Array of colors for t-shirt icons
const tshirtColors = [
  '#FF8A65', // orange
  '#4FC3F7', // blue
  '#81C784', // green
  '#FFD54F', // yellow
  '#BA68C8', // purple
  '#E57373', // red
  '#90A4AE', // grey
  '#F06292', // pink
];

// Helper to render random apparel icons in the background
function getRandomTshirts(count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const color = tshirtColors[Math.floor(Math.random() * tshirtColors.length)];
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = 36 + Math.random() * 48; // 36px to 84px
    const opacity = 0.10 + Math.random() * 0.15;
    const rotate = Math.random() * 360;
    return (
      <GiTShirt
        key={`tshirt-${i}`}
        style={{
          position: 'absolute',
          top: `${top}%`,
          left: `${left}%`,
          fontSize: size,
          color,
          opacity,
          transform: `rotate(${rotate}deg)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    );
  });
}

function BusinessCard() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      {/* Random T-shirts in the background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {getRandomTshirts(18)}
      </Box>

      {/* Glass tile business card */}
      <Card
        sx={{
          maxWidth: 370,
          width: '100%',
          px: 3,
          py: 4,
          borderRadius: 5,
          boxShadow: 8,
          backdropFilter: 'blur(16px) saturate(180%)',
          background: 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.25)',
          zIndex: 1,
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <Avatar
            alt="Prudhvi"
            src={kpjLogo}
            sx={{
              width: 90,
              height: 90,
              bgcolor: 'white',
              border: '2px solid #fff',
              boxShadow: 2,
            }}
          />
        </Box>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h5" textAlign="center" fontWeight={700} letterSpacing={1}>
            Prudhvi
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
            Custom Garment Printing Expert
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
            <PhoneIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={500}>8074175884 / 8555909245</Typography>
          </Stack>
          <Typography textAlign="center" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            📍 Madhurawada, Visakhapatnam
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
            <IconButton
              color="success"
              href="https://wa.me/918074175884"
              target="_blank"
              rel="noopener"
              sx={{ bgcolor: 'white', boxShadow: 1 }}
            >
              <WhatsAppIcon />
            </IconButton>
            <IconButton
              color="primary"
              href="mailto:yourmail@example.com"
              sx={{ bgcolor: 'white', boxShadow: 1 }}
            >
              <EmailIcon />
            </IconButton>
            <IconButton
              color="secondary"
              href="https://instagram.com/kpj_tshirts"
              target="_blank"
              rel="noopener"
              sx={{ bgcolor: 'white', boxShadow: 1 }}
            >
              <InstagramIcon />
            </IconButton>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            href="https://instagram.com/kpj_tshirts"
            target="_blank"
            rel="noopener"
            sx={{
              mt: 1,
              fontWeight: 600,
              letterSpacing: 1,
              borderRadius: 3,
              boxShadow: 2,
              background: 'linear-gradient(90deg, #ff512f 0%, #dd2476 100%)',
            }}
            startIcon={<InstagramIcon />}
          >
            Follow on Instagram
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default BusinessCard;
