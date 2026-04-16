import { createTheme, alpha } from "@mui/material/styles";

export const pumpGoTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5B8DFF",
      light: "#8EB0FF",
      dark: "#3D6AE0",
      contrastText: "#0B1020",
    },
    secondary: {
      main: "#2DD4BF",
      light: "#5EEAD4",
      dark: "#14B8A6",
      contrastText: "#041016",
    },
    warning: {
      main: "#F5C451",
      contrastText: "#1A1204",
    },
    background: {
      default: "#070B14",
      paper: "#101A2E",
    },
    text: {
      primary: "#F4F7FF",
      secondary: "rgba(228, 236, 255, 0.78)",
      disabled: "rgba(228, 236, 255, 0.45)",
    },
    divider: "rgba(255, 255, 255, 0.1)",
    action: {
      active: "rgba(255, 255, 255, 0.9)",
      hover: "rgba(255, 255, 255, 0.08)",
      selected: alpha("#5B8DFF", 0.18),
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: "none" },
    caption: { letterSpacing: 0.2 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#070B14",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: `linear-gradient(165deg, ${alpha("#162544", 0.98)} 0%, ${alpha("#0D1528", 0.99)} 100%)`,
          border: `1px solid ${alpha("#5B8DFF", 0.2)}`,
          boxShadow: `0 24px 48px ${alpha("#000", 0.45)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #6B9FFF 0%, #4A7AE8 55%, #3D6AE0 100%)",
          boxShadow: `0 8px 24px ${alpha("#5B8DFF", 0.35)}`,
          "&:hover": {
            background: "linear-gradient(135deg, #7BA6FF 0%, #5284F0 100%)",
            boxShadow: `0 10px 28px ${alpha("#5B8DFF", 0.45)}`,
          },
        },
        outlined: {
          borderColor: alpha("#fff", 0.22),
          color: "#F4F7FF",
          "&:hover": {
            borderColor: alpha("#5B8DFF", 0.55),
            backgroundColor: alpha("#5B8DFF", 0.08),
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export function glassSurface(theme, strength = 0.52) {
  const base = alpha("#121C33", strength);
  return {
    backgroundColor: base,
    backdropFilter: "blur(16px) saturate(140%)",
    border: `1px solid ${alpha(theme.palette.primary.light, 0.14)}`,
    boxShadow: `0 16px 48px ${alpha("#020617", 0.35)}, inset 0 1px 0 ${alpha("#fff", 0.06)}`,
  };
}
