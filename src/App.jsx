import { Box, Grid, Stack, Typography, alpha } from "@mui/material";

const HEADER_LOGO_SRC = "/assets/pumpgo-header-logo.png";
const HERO_BANNER_SRC = "/assets/hero-skip-the-line.png";
const FOOTER_BANNER_SRC = "/assets/footer-order-ahead.png";
const LANDING_BG_DESKTOP_SRC = "/assets/landing-hero-bg.png";
const LANDING_BG_MOBILE_SRC = "/assets/landing-night-bg.png";

const PUMPGO_CUSTOMER_APP_URL = "https://customer.pumpgo.app";

const CONTENT_MAX_WIDTH = 980;

const categoryTiles = [
  { id: "snacks", title: "Snacks", src: "/assets/categories/snacks.png", alt: "Snacks" },
  { id: "tobacco", title: "Tobacco", src: "/assets/categories/tobacco.png", alt: "Tobacco — ID required at pickup" },
  { id: "kitchen", title: "Kitchen", src: "/assets/categories/kitchen.png", alt: "Kitchen — fresh, made to order" },
  { id: "drinks", title: "Drinks", src: "/assets/categories/drinks.png", alt: "Drinks" },
  { id: "meds", title: "Meds", src: "/assets/categories/meds.png", alt: "Meds — pain relief, cold and allergy" },
  { id: "alcohol", title: "Alcohol", src: "/assets/categories/alcohol.png", alt: "Alcohol — ID required at pickup" },
];

function CategoryCard({ src, alt, title }) {
  return (
    <Box sx={{ borderRadius: 2, overflow: "hidden", lineHeight: 0, bgcolor: alpha("#020617", 0.3) }}>
      <Box component="img" src={src} alt={alt} sx={{ width: "100%", height: "auto", display: "block" }} />
      <Box
        sx={{
          py: 0.7,
          px: 1,
          textAlign: "center",
          bgcolor: alpha("#020617", 0.72),
          borderTop: `1px solid ${alpha("#fff", 0.1)}`,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: "0.75rem", sm: "0.82rem", md: "0.86rem" },
            letterSpacing: 0.25,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
}

function CustomerQrBlock() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: 260, sm: 300, md: "100%" },
        mx: "auto",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "#fff",
        boxShadow: "0 8px 28px rgba(15, 23, 42, 0.1)",
      }}
    >
      <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
        <Box
          component="img"
          src="/assets/customer-qr.png"
          alt="Scan to order"
          sx={{ display: "block", width: "100%", height: "auto" }}
        />
      </Box>
      <Box
        component="a"
        href={PUMPGO_CUSTOMER_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "block",
          py: { xs: 1, sm: 1.25 },
          px: 2,
          textAlign: "center",
          bgcolor: "#0a0a0c",
          textDecoration: "none",
          "&:hover": { bgcolor: "#121218" },
        }}
      >
        <Typography sx={{ color: "#E8B84A", fontWeight: 800, fontSize: { xs: "0.9rem", sm: "1.05rem" }, letterSpacing: 0.6 }}>
          Start Your Order!
        </Typography>
      </Box>
    </Box>
  );
}

function App() {
  const [snacks, tobacco, kitchen, drinks, meds, alcohol] = categoryTiles;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100%",
        position: "relative",
        isolation: "isolate",
        bgcolor: "#0a1428",
        backgroundImage: {
          xs: `url("${LANDING_BG_MOBILE_SRC}")`,
          md: `url("${LANDING_BG_DESKTOP_SRC}")`,
        },
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: { xs: "scroll", md: "fixed" },
        py: { xs: 0, sm: 1.5 },
        px: { xs: 0, sm: 1.5 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: CONTENT_MAX_WIDTH,
          mx: "auto",
          minHeight: { xs: "100dvh", sm: "calc(100dvh - 24px)" },
          display: "flex",
          flexDirection: "column",
          bgcolor: "transparent",
        }}
      >
      {/* Header */}
      <Box
        sx={{
          textAlign: "center",
          pt: { xs: 1.5, sm: 2.5 },
          pb: { xs: 1.25, sm: 1.5 },
          borderBottom: `1px solid ${alpha("#fff", 0.22)}`,
        }}
      >
        <Box
          component="img"
          src={HEADER_LOGO_SRC}
          alt="PumpGo — Convenience at Full Speed"
          sx={{
            height: { xs: 100, sm: 130, md: 160 },
            width: "auto",
            maxWidth: { xs: "100%", sm: 580, md: 700 },
            objectFit: "contain",
            display: "inline-block",
          }}
        />
      </Box>

      {/* Hero banner */}
      <Box sx={{ lineHeight: 0, pt: { xs: 0.5, sm: 0.75 } }}>
        <Box
          component="img"
          src={HERO_BANNER_SRC}
          alt="Skip the Line! At a Nearby Gas Station"
          sx={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>

      {/* Body */}
      <Stack
        spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          pt: { xs: 2, sm: 2.5, md: 3 },
          pb: { xs: 1.5, sm: 2, md: 2.5 },
          borderTop: `1px solid ${alpha("#fff", 0.22)}`,
          flex: 1,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: alpha("#f1f5f9", 0.92),
            lineHeight: 1.55,
            fontSize: { xs: "0.88rem", sm: "1.02rem" },
            textAlign: "center",
            textShadow: "0 1px 12px rgba(0,0,0,0.55)",
          }}
        >
          Scan the code to order snacks, drinks, food, and more — right from the pump or the parking spot.
        </Typography>

        {/* Desktop (md+): categories | QR | categories */}
        <Grid container spacing={2} sx={{ display: { xs: "none", md: "flex" }, width: "100%", m: 0, alignItems: "stretch" }}>
          <Grid size={3} sx={{ display: "flex", minWidth: 0 }}>
            <Stack spacing={2} sx={{ width: "100%", justifyContent: "space-between" }}>
              <CategoryCard src={snacks.src} alt={snacks.alt} title={snacks.title} />
              <CategoryCard src={tobacco.src} alt={tobacco.alt} title={tobacco.title} />
              <CategoryCard src={kitchen.src} alt={kitchen.alt} title={kitchen.title} />
            </Stack>
          </Grid>
          <Grid size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
            <CustomerQrBlock />
          </Grid>
          <Grid size={3} sx={{ display: "flex", minWidth: 0 }}>
            <Stack spacing={2} sx={{ width: "100%", justifyContent: "space-between" }}>
              <CategoryCard src={drinks.src} alt={drinks.alt} title={drinks.title} />
              <CategoryCard src={meds.src} alt={meds.alt} title={meds.title} />
              <CategoryCard src={alcohol.src} alt={alcohol.alt} title={alcohol.title} />
            </Stack>
          </Grid>
        </Grid>

        {/* Tablet (sm–md): 2-col categories, QR below */}
        <Stack spacing={1.5} sx={{ display: { xs: "none", sm: "flex", md: "none" }, width: "100%", alignItems: "center" }}>
          <Grid container spacing={1.5} sx={{ width: "100%", m: 0 }}>
            {categoryTiles.map((c) => (
              <Grid key={c.id} size={4} sx={{ minWidth: 0 }}>
                <CategoryCard src={c.src} alt={c.alt} title={c.title} />
              </Grid>
            ))}
          </Grid>
          <CustomerQrBlock />
        </Stack>

        {/* Mobile (xs): QR first, then 2-col categories */}
        <Stack spacing={1.5} sx={{ display: { xs: "flex", sm: "none" }, width: "100%", alignItems: "center" }}>
          <CustomerQrBlock />
          <Grid container spacing={1} sx={{ width: "100%", m: 0 }}>
            {categoryTiles.map((c) => (
              <Grid key={c.id} size={6} sx={{ minWidth: 0 }}>
                <CategoryCard src={c.src} alt={c.alt} title={c.title} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>

      {/* Footer banner */}
      <Box
        sx={{
          lineHeight: 0,
          mt: "auto",
          pt: { xs: 0.5, sm: 0.75 },
          borderTop: `1px solid ${alpha("#fff", 0.22)}`,
        }}
      >
        <Box
          component="img"
          src={FOOTER_BANNER_SRC}
          alt="Gas Station Order Ahead. Starts with PumpGo."
          sx={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>

      <Box
        component="footer"
        aria-label="Site information"
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.75, sm: 2.25 },
          textAlign: "center",
          bgcolor: "transparent",
          borderTop: `1px solid ${alpha("#fff", 0.22)}`,
        }}
      >
        <Typography
          sx={{
            color: alpha("#f1f5f9", 0.88),
            fontSize: "0.8rem",
            lineHeight: 1.55,
            textShadow: "0 1px 10px rgba(0,0,0,0.5)",
          }}
        >
          © {new Date().getFullYear()} PumpGo · Convenience at full speed
        </Typography>
      </Box>
      </Box>
    </Box>
  );
}

export default App;
