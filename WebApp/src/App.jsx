import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  CssBaseline,
  Box,
  Container,
} from "@mui/material";
import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import kpjLogo from "./assets/kpjLogo.svg";
import Header from "./components/Header";

function App() {
  const [mode, setMode] = useState("light"); // Default mode is light
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header mode={mode} onModeChange={setMode} />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Container
                maxWidth="md"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 4,
                  width: "100%",
                  maxWidth: "1230px",
                }}
              >
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </Container>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
