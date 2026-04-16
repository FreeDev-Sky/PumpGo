import { Avatar, Box, Grid, Stack, Typography, alpha } from "@mui/material";

const HEADER_LOGO_SRC = "/assets/pumpgo-header-logo.png";
const HERO_BANNER_SRC = "/assets/hero-skip-the-line.png";
const FOOTER_BANNER_SRC = "/assets/footer-order-ahead.png";

const PUMPGO_CUSTOMER_APP_URL = "https://customer-pumpgo.glide.page";

const CONTENT_MAX_WIDTH = 980;

const qrImageForUrl = (url) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=${encodeURIComponent(url)}`;

const categoryTiles = [
  { id: "snacks", src: "/assets/categories/snacks.png", alt: "Snacks" },
  { id: "tobacco", src: "/assets/categories/tobacco.png", alt: "Tobacco — ID required at pickup" },
  { id: "kitchen", src: "/assets/categories/kitchen.png", alt: "Kitchen — fresh, made to order" },
  { id: "drinks", src: "/assets/categories/drinks.png", alt: "Drinks" },
  { id: "meds", src: "/assets/categories/meds.png", alt: "Meds — pain relief, cold and allergy" },
  { id: "alcohol", src: "/assets/categories/alcohol.png", alt: "Alcohol — ID required at pickup" },
];

function CategoryCard({ src, alt }) {
  return (
    <Box sx={{ borderRadius: 2, overflow: "hidden", lineHeight: 0 }}>
      <Box component="img" src={src} alt={alt} sx={{ width: "100%", height: "auto", display: "block" }} />
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
      <Box sx={{ position: "relative", p: { xs: 1, sm: 1.5 } }}>
        <Box
          component="img"
          src={qrImageForUrl(PUMPGO_CUSTOMER_APP_URL)}
          alt="Scan to order"
          sx={{ display: "block", width: "100%", height: "auto" }}
        />
        <Avatar
          src="/assets/logo.png"
          alt=""
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 40, sm: 48, md: 56 },
            height: { xs: 40, sm: 48, md: 56 },
            border: "3px solid #fff",
            boxShadow: `0 4px 14px ${alpha("#000", 0.15)}`,
          }}
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
        width: "100%",
        maxWidth: CONTENT_MAX_WIDTH,
        mx: "auto",
        minHeight: "100dvh",
        bgcolor: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", pt: { xs: 1.5, sm: 2.5 }, pb: { xs: 0.5, sm: 1 } }}>
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
      <Box sx={{ lineHeight: 0 }}>
        <Box
          component="img"
          src={HERO_BANNER_SRC}
          alt="Skip the Line! At a Nearby Gas Station"
          sx={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>

      {/* Body */}
      <Stack spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 1.5, sm: 2 }, flex: 1 }}>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", lineHeight: 1.55, fontSize: { xs: "0.88rem", sm: "1.02rem" }, textAlign: "center" }}
        >
          Scan the code to order snacks, drinks, food, and more — right from the pump or the parking spot.
        </Typography>

        {/* Desktop (md+): categories | QR | categories */}
        <Grid container spacing={2} sx={{ display: { xs: "none", md: "flex" }, width: "100%", m: 0, alignItems: "stretch" }}>
          <Grid size={3} sx={{ display: "flex", minWidth: 0 }}>
            <Stack spacing={2} sx={{ width: "100%", justifyContent: "space-between" }}>
              <CategoryCard src={snacks.src} alt={snacks.alt} />
              <CategoryCard src={tobacco.src} alt={tobacco.alt} />
              <CategoryCard src={kitchen.src} alt={kitchen.alt} />
            </Stack>
          </Grid>
          <Grid size={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
            <CustomerQrBlock />
          </Grid>
          <Grid size={3} sx={{ display: "flex", minWidth: 0 }}>
            <Stack spacing={2} sx={{ width: "100%", justifyContent: "space-between" }}>
              <CategoryCard src={drinks.src} alt={drinks.alt} />
              <CategoryCard src={meds.src} alt={meds.alt} />
              <CategoryCard src={alcohol.src} alt={alcohol.alt} />
            </Stack>
          </Grid>
        </Grid>

        {/* Tablet (sm–md): 2-col categories, QR below */}
        <Stack spacing={1.5} sx={{ display: { xs: "none", sm: "flex", md: "none" }, width: "100%", alignItems: "center" }}>
          <Grid container spacing={1.5} sx={{ width: "100%", m: 0 }}>
            {categoryTiles.map((c) => (
              <Grid key={c.id} size={4} sx={{ minWidth: 0 }}>
                <CategoryCard src={c.src} alt={c.alt} />
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
                <CategoryCard src={c.src} alt={c.alt} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>

      {/* Footer banner */}
      <Box sx={{ lineHeight: 0, mt: "auto" }}>
        <Box
          component="img"
          src={FOOTER_BANNER_SRC}
          alt="Gas Station Order Ahead. Starts with PumpGo."
          sx={{ width: "100%", height: "auto", display: "block" }}
        />
      </Box>
    </Box>
  );
}

export default App;
