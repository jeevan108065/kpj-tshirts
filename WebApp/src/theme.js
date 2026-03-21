import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 480, md: 768, lg: 1024, xl: 1280 },
  },
  palette: {
    primary: { main: "#3393E0", dark: "#1B4F72", light: "#E8F4FD" },
    secondary: { main: "#F5A623" },
    background: { default: "#FFFFFF", paper: "#F8FBFF" },
    text: { primary: "#1E3A5F", secondary: "#5A6F8A" },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
      styleOverrides: {
        root: ({ theme: t }) => ({
          paddingLeft: 16,
          paddingRight: 16,
          [t.breakpoints.up("sm")]: { paddingLeft: 24, paddingRight: 24 },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: "10px 24px" },
        containedPrimary: {
          background: "linear-gradient(135deg, #3393E0 0%, #2578B5 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #2578B5 0%, #1B4F72 100%)",
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
