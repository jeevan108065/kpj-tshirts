import { Card, CardContent, Typography, Avatar, Box, Button } from '@mui/material';

function BusinessCard() {
  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ maxWidth: 345, padding: 2 }}>
        <Box display="flex" justifyContent="center">
          <Avatar
            alt="Prudhvi"
            src="https://via.placeholder.com/150"
            sx={{ width: 100, height: 100 }}
          />
        </Box>
        <CardContent>
          <Typography variant="h5" textAlign="center">Prudhvi</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Custom Garment Printing Expert
          </Typography>
          <Typography mt={2} textAlign="center">📞 8074175884 / 8555909245</Typography>
          <Typography textAlign="center">📍 Madhurawada, Visakhapatnam</Typography>

          <Box mt={2} display="flex" justifyContent="space-around">
            <Button variant="outlined" href="https://wa.me/918074175884" target="_blank">
              WhatsApp
            </Button>
            <Button variant="outlined" href="mailto:yourmail@example.com">
              Email
            </Button>
          </Box>

          <Box mt={2} display="flex" justifyContent="center">
            <Button variant="contained" color="primary" href="https://instagram.com/yourpage" target="_blank">
              Instagram
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default BusinessCard;
