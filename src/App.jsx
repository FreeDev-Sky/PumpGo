import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import DeliveryDiningRounded from "@mui/icons-material/DeliveryDiningRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import QrCode2Rounded from "@mui/icons-material/QrCode2Rounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { glassSurface } from "./theme";

const PUMPGO_CUSTOMER_APP_URL = "https://customer-pumpgo.glide.page";
const PUMPGO_STATION_APP_URL = "https://station-pumpgo.glide.page";

const CONTENT_MAX_WIDTH = 920;

const qrImageForUrl = (url) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=${encodeURIComponent(url)}`;

const qrCodeApps = [
  {
    key: "customer",
    chipLabel: "Customer app",
    chipIcon: <DeliveryDiningRounded sx={{ fontSize: 24 }} />,
    title: "Guests at the pump",
    description: "Order snacks, drinks, and food ahead — scan while you fuel or walk in.",
    url: PUMPGO_CUSTOMER_APP_URL,
    accent: { chipBg: alpha("#5B8DFF", 0.22), border: alpha("#93C5FD", 0.35) },
  },
  {
    key: "station",
    chipLabel: "Station / staff",
    chipIcon: <StorefrontRounded sx={{ fontSize: 24 }} />,
    title: "Counter & back room",
    description: "See orders, move them through prep, and mark ready for pickup.",
    url: PUMPGO_STATION_APP_URL,
    accent: { chipBg: alpha("#F5C451", 0.18), border: alpha("#F5C451", 0.4) },
  },
];

const paperFrame = {
  borderRadius: 3,
  ...glassSurface({ palette: { primary: { dark: "#1D4ED8", light: "#93C5FD" } } }, 0.52),
  border: "1px solid rgba(255,255,255,0.12)",
};

function App() {
  const [copyToast, setCopyToast] = useState({ open: false, message: "" });

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyToast({ open: true, message: "Link copied to clipboard" });
    } catch {
      setCopyToast({ open: true, message: "Could not copy — try selecting the link" });
    }
  };

  return (
    <>
      <Snackbar
        open={copyToast.open}
        autoHideDuration={2200}
        onClose={() => setCopyToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={copyToast.message}
      />
      <Box
        sx={{
          position: "relative",
          boxSizing: "border-box",
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          backgroundImage: 'url("/assets/background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          px: { xs: 1.5, sm: 2, md: 2.5 },
          py: { xs: 1.5, md: 2 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 14% 10%, rgba(91,141,255,0.22), transparent 32%), radial-gradient(circle at 92% 88%, rgba(45,212,191,0.16), transparent 36%), linear-gradient(180deg, rgba(4,9,22,0.58), rgba(4,9,22,0.82))",
          }}
        />

        <Box
          sx={{
            position: "relative",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Stack spacing={2.5} sx={{ width: "100%", maxWidth: CONTENT_MAX_WIDTH, mx: "auto" }}>
          <AppBar
            position="static"
            sx={{
              flexShrink: 0,
              borderRadius: 3,
              width: "100%",
              ...glassSurface({ palette: { primary: { dark: "#1D4ED8", light: "#93C5FD" } } }, 0.6),
              border: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            <Toolbar sx={{ justifyContent: "space-between", gap: 1.5, py: 1, flexWrap: "wrap", rowGap: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar src="/assets/logo.png" alt="PumpGo logo" sx={{ width: 44, height: 44, border: "2px solid rgba(147,197,253,0.35)" }} />
                <Stack spacing={0.25}>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                    PumpGo
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
                    QR links — customer & station
                  </Typography>
                </Stack>
              </Stack>
              <Button size="small" variant="contained" component="a" href={PUMPGO_CUSTOMER_APP_URL} target="_blank" rel="noopener noreferrer">
                Get App
              </Button>
            </Toolbar>
          </AppBar>

          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, ...paperFrame, width: "100%", flex: 1, boxSizing: "border-box" }}>
            <Stack spacing={2.75} sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<QrCode2Rounded sx={{ fontSize: 22 }} />}
                  label="Scan to open"
                  sx={{ bgcolor: alpha("#5B8DFF", 0.2), color: "#F4F7FF", border: "1px solid rgba(147,197,253,0.35)", "& .MuiChip-icon": { color: "inherit" } }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.85rem" } }}>
                  Customer & station apps
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6, fontSize: "1.05rem" }}>
                Guests use the customer code; your team uses the station code. Point a phone camera at the square — no typing.
              </Typography>

              <Grid container spacing={2.5} sx={{ width: "100%", m: 0 }}>
                {qrCodeApps.map((app) => (
                  <Grid key={app.key} size={{ xs: 12, md: 6 }} sx={{ minWidth: 0, display: "flex", alignItems: "stretch" }}>
                    <Paper
                      elevation={0}
                      sx={{
                        flex: 1,
                        width: "100%",
                        minHeight: { xs: 440, md: 480 },
                        p: { xs: 2.25, md: 3 },
                        borderRadius: 2.5,
                        bgcolor: alpha("#fff", 0.06),
                        border: `1px solid ${alpha("#fff", 0.12)}`,
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                      }}
                    >
                      <Stack spacing={1.25} alignItems="center" textAlign="center" sx={{ width: "100%", flexShrink: 0 }}>
                        <Chip
                          icon={app.chipIcon}
                          label={app.chipLabel}
                          sx={{
                            bgcolor: app.accent.chipBg,
                            color: "#F4F7FF",
                            border: `1px solid ${app.accent.border}`,
                            "& .MuiChip-icon": { color: "inherit" },
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.15rem" }}>
                          {app.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                          {app.description}
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          minHeight: 0,
                          py: { xs: 1.5, md: 2 },
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "min(300px, 42vw, 92vw)",
                            maxWidth: "100%",
                            aspectRatio: "1",
                            borderRadius: 2,
                            bgcolor: "#fff",
                            boxShadow: `0 12px 28px ${alpha("#000", 0.28)}`,
                            border: `1px solid ${alpha("#fff", 0.2)}`,
                            flexShrink: 0,
                            boxSizing: "border-box",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component="img"
                            src={qrImageForUrl(app.url)}
                            alt=""
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "block",
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                          <Avatar
                            src="/assets/logo.png"
                            alt=""
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: 56,
                              height: 56,
                              border: "3px solid #fff",
                              boxShadow: `0 4px 14px ${alpha("#000", 0.2)}`,
                              zIndex: 1,
                            }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: { xs: "stretch", sm: "center" },
                          gap: 1,
                          width: "100%",
                          maxWidth: "100%",
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha("#000", 0.22),
                          border: `1px solid ${alpha("#fff", 0.1)}`,
                          boxSizing: "border-box",
                          flexShrink: 0,
                          mt: "auto",
                        }}
                      >
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              maxWidth: "100%",
                              color: "text.secondary",
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                              fontWeight: 600,
                              textAlign: "left",
                              fontSize: "0.9375rem",
                              lineHeight: 1.35,
                            }}
                          >
                            {app.url}
                          </Typography>
                          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, justifyContent: { xs: "center", sm: "flex-end" } }}>
                            <Tooltip title="Copy link">
                              <IconButton
                                type="button"
                                onClick={() => copyLink(app.url)}
                                aria-label={`Copy ${app.chipLabel} link`}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  color: "#F4F7FF",
                                  bgcolor: alpha("#5B8DFF", 0.35),
                                  border: `1px solid ${alpha("#93C5FD", 0.35)}`,
                                  "&:hover": { bgcolor: alpha("#5B8DFF", 0.5) },
                                }}
                              >
                                <ContentCopyRounded />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Open in browser">
                              <IconButton
                                component="a"
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${app.chipLabel}`}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  color: "#041016",
                                  bgcolor: alpha("#2DD4BF", 0.55),
                                  border: `1px solid ${alpha("#5EEAD4", 0.45)}`,
                                  "&:hover": { bgcolor: alpha("#2DD4BF", 0.72) },
                                }}
                              >
                                <OpenInNewRounded />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Paper>
          </Stack>
        </Box>
      </Box>
    </>
  );
}

export default App;
