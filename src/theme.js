import { createTheme, alpha } from "@mui/material/styles";

export const pumpGoTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563EB",
      light: "#60A5FA",
      dark: "#1D4ED8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0D9488",
      light: "#2DD4BF",
      dark: "#0F766E",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#D97706",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "rgba(15, 23, 42, 0.68)",
      disabled: "rgba(15, 23, 42, 0.38)",
    },
    divider: "rgba(15, 23, 42, 0.12)",
    action: {
      active: "rgba(15, 23, 42, 0.9)",
      hover: "rgba(15, 23, 42, 0.06)",
      selected: alpha("#2563EB", 0.12),
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
          backgroundColor: "#ffffff",
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
          backgroundImage: "none",
          backgroundColor: "#ffffff",
          border: `1px solid ${alpha("#2563EB", 0.2)}`,
          boxShadow: `0 24px 48px ${alpha("#0f172a", 0.12)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)",
          boxShadow: `0 4px 14px ${alpha("#2563EB", 0.35)}`,
          "&:hover": {
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow: `0 6px 20px ${alpha("#2563EB", 0.4)}`,
          },
        },
        outlined: {
          borderColor: alpha("#0f172a", 0.2),
          color: "#0f172a",
          "&:hover": {
            borderColor: alpha("#2563EB", 0.55),
            backgroundColor: alpha("#2563EB", 0.06),
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
