import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, CssBaseline } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import kpjLogo from './assets/kpjLogo.svg'; // Adjust the path as necessary

function App() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <img src={kpjLogo} alt="KPJ Logo" style={{ height: 40, marginRight: 16 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Digital Card
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/about">About</Button>
          <Button color="inherit" component={Link} to="/contact">Contact</Button>
          <IconButton color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
