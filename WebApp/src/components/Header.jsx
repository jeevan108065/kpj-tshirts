import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import { AppBar, Button, IconButton, Toolbar, Typography } from "@mui/material";
import React from "react";
import kpjLogo from "../assets/kpjLogo.svg";
import { Link } from "react-router-dom";

const Header = ({ mode, onModeChange }) => {
  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{ width: "100%" }}
      style={{
        backdropFilter: "blur(12px) saturate(180%)",
        backgroundColor: "#3393e0",
      }}
    >
      <Toolbar sx={{ width: "100%" }}>
        <img
          src={kpjLogo}
          alt="KPJ Logo"
          style={{ height: 40, marginRight: 16 }}
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
          }}
        >
          T-Shirts
        </Typography>
        <Button color="inherit" component={Link} to="/kpj-tshirts/">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/kpj-tshirts/about">
          About
        </Button>
        <Button color="inherit" component={Link} to="/kpj-tshirts/contact">
          Contact
        </Button>
        <IconButton
          color="inherit"
          onClick={() => onModeChange(mode === "light" ? "dark" : "light")}
        >
          {mode === "light" ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
