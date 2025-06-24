import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import { AppBar, Button, IconButton, Toolbar, Typography } from "@mui/material";
import React from "react";
import kpjLogo from "../assets/kpjLogo.svg";
import { Link } from "react-router-dom";

const Header = ({ mode, onModeChange }) => {
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: "100%",
        px: { xs: 1, sm: 2 },
      }}
      style={{
        backdropFilter: "blur(12px) saturate(180%)",
        backgroundColor: "#3393e0",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <img
          src={kpjLogo}
          alt="KPJ Logo"
          style={{ height: 32, marginRight: 10, maxWidth: "90vw" }}
        />
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            color: "#FAFBFB",
            fontFamily: "Inter",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "normal",
            textTransform: "uppercase",
            fontSize: { xs: 18, sm: 22 },
          }}
        >
          T-Shirts
        </Typography>
        <Button
          color="inherit"
          component={Link}
          to="/kpj-tshirts/"
          sx={{ fontSize: { xs: 13, sm: 16 } }}
        >
          Home
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/kpj-tshirts/about"
          sx={{ fontSize: { xs: 13, sm: 16 } }}
        >
          About
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/kpj-tshirts/contact"
          sx={{ fontSize: { xs: 13, sm: 16 } }}
        >
          Contact
        </Button>
        {/* <IconButton
          color="inherit"
          onClick={() => onModeChange(mode === "light" ? "dark" : "light")}
        >
          {mode === "light" ? <Brightness4 /> : <Brightness7 />}
        </IconButton> */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
