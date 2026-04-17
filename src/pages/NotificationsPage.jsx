import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";

const ONESIGNAL_APP_ID = "75b1e381-313b-4536-a06f-386d7b82f236";
const SW_PATH = "/OneSignalSDKWorker.js";
const ONESIGNAL_SCRIPT = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";

function loadOneSignalScript() {
  if (document.querySelector('script[data-pumpgo-onesignal="1"]')) return;
  const s = document.createElement("script");
  s.src = ONESIGNAL_SCRIPT;
  s.defer = true;
  s.dataset.pumpgoOnesignal = "1";
  document.head.appendChild(s);
}

function browserPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

function subscriptionId(OneSignal) {
  try {
    return OneSignal.User?.PushSubscription?.id ?? null;
  } catch {
    return null;
  }
}

function isPushSupported(OneSignal) {
  try {
    return OneSignal.Notifications?.isPushSupported() === true;
  } catch {
    return false;
  }
}

/** Module scope so React Strict Mode remounts do not queue OneSignal.init twice. */
let oneSignalInitPromise = null;

function initOneSignalOnce() {
  if (oneSignalInitPromise) return oneSignalInitPromise;

  oneSignalInitPromise = new Promise((resolve, reject) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          serviceWorkerPath: SW_PATH,
          autoResubscribe: true,
          allowLocalhostAsSecureOrigin: isLocal,
        });
        resolve(OneSignal);
      } catch (err) {
        oneSignalInitPromise = null;
        reject(err);
      }
    });
  });

  return oneSignalInitPromise;
}

function waitForSubscriptionId(OneSignal, timeoutMs) {
  const existing = subscriptionId(OneSignal);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (id) => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(timer);
      try {
        OneSignal.User.PushSubscription.removeEventListener("change", onChange);
      } catch {
        /* ignore */
      }
      resolve(id || null);
    };

    const onChange = () => {
      const id = subscriptionId(OneSignal);
      if (id) finish(id);
    };

    try {
      OneSignal.User.PushSubscription.addEventListener("change", onChange);
    } catch {
      /* ignore */
    }

    const poll = setInterval(() => {
      const id = subscriptionId(OneSignal);
      if (id) finish(id);
    }, 250);

    const timer = setTimeout(() => finish(subscriptionId(OneSignal)), timeoutMs);
  });
}

async function loginExternalUser(OneSignal, externalId) {
  try {
    await OneSignal.login(externalId);
  } catch (e) {
    const msg = String(e?.message || e || "");
    if (/409|conflict/i.test(msg)) {
      await OneSignal.logout();
      await OneSignal.login(externalId);
      return;
    }
    throw e;
  }
}

async function optInToPushIfAvailable(OneSignal) {
  const ps = OneSignal.User?.PushSubscription;
  if (ps && typeof ps.optIn === "function") {
    await ps.optIn();
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Opt in and wait for a push subscription id (retries help after alerts were turned off or reset).
 */
async function ensureActivePushSubscription(OneSignal) {
  await optInToPushIfAvailable(OneSignal);
  let id = await waitForSubscriptionId(OneSignal, 22000);
  if (!id) {
    await sleep(500);
    await optInToPushIfAvailable(OneSignal);
    id = await waitForSubscriptionId(OneSignal, 14000);
  }
  if (!id) {
    await sleep(500);
    await optInToPushIfAvailable(OneSignal);
    id = await waitForSubscriptionId(OneSignal, 10000);
  }
  return id;
}

export default function NotificationsPage() {
  const [searchParams] = useSearchParams();
  /** Account id from the app link (?user_id=…). */
  const userId = (searchParams.get("user_id") ?? "").trim() || null;

  const [notice, setNotice] = useState({ severity: null, text: "" });
  const [loading, setLoading] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  /** Two-step flow: first tap shows you chose alerts; second tap asks the browser (better for phones and browsers). */
  const [intentReady, setIntentReady] = useState(false);

  useEffect(() => {
    loadOneSignalScript();
  }, []);

  useEffect(() => {
    setIntentReady(false);
    setLinkSuccess(false);
    if (!userId) {
      setNotice({
        severity: "warning",
        text: "Open this page using the link from the PumpGo app. If you opened it another way, go back and use “Turn on notifications” (or similar) inside the app.",
      });
    } else if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      setNotice({
        severity: "info",
        text: "This site is already allowed to send notifications. If alerts stopped working, tap Get started, then Turn on alerts again to refresh this device.",
      });
    } else {
      setNotice({ severity: null, text: "" });
    }
  }, [userId]);

  useEffect(() => {
    if (!navigator.permissions?.query) return undefined;
    let status;
    let cancelled = false;
    const onPermChange = () => {
      if (Notification.permission === "granted") {
        setNotice({
          severity: "info",
          text: "Notifications are now allowed for this website. Tap Get started (if you haven’t), then Turn on alerts to finish.",
        });
      }
    };
    navigator.permissions
      .query({ name: "notifications" })
      .then((s) => {
        if (cancelled) return;
        status = s;
        s.addEventListener("change", onPermChange);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (status) status.removeEventListener("change", onPermChange);
    };
  }, []);

  const runSubscribe = useCallback(async () => {
    if (!intentReady) {
      setNotice({
        severity: "warning",
        text: "Tap Get started first, then tap Turn on alerts.",
      });
      return;
    }

    if (!userId) {
      setNotice({
        severity: "warning",
        text: "Use the notification link from the PumpGo app so we know which account to use.",
      });
      return;
    }

    setNotice({ severity: null, text: "" });
    setLoading(true);
    try {
      const OneSignal = await initOneSignalOnce();

      /* Identify user before subscribe so OneSignal ties permission + device to your external id (fewer edge cases on mobile). */
      try {
        await loginExternalUser(OneSignal, userId);
      } catch (e) {
        console.warn("OneSignal.login (pre-permission)", e);
      }

      if (!isPushSupported(OneSignal)) {
        setNotice({
          severity: "error",
          text: "This browser can’t receive these alerts. Try opening this page in Safari or Chrome, in a regular tab (not inside another app’s browser).",
        });
        return;
      }

      let perm = browserPermission();
      if (perm === "denied") {
        setNotice({
          severity: "warning",
          text: "Alerts are turned off for this site. In your browser, open settings for this website and allow notifications, then come back and tap Turn on alerts again.",
        });
        return;
      }

      await OneSignal.Notifications.requestPermission();

      perm = browserPermission();
      if (perm !== "granted") {
        setNotice({
          severity: "warning",
          text: "We still don’t have permission to send alerts. Tap Turn on alerts again, choose Allow if you see a prompt, or turn on notifications for this site in your browser settings.",
        });
        return;
      }

      const subId = await ensureActivePushSubscription(OneSignal);
      if (!subId) {
        setNotice({
          severity: "error",
          text: "We couldn’t finish connecting alerts on this device. Check your internet connection, wait a few seconds, and tap Turn on alerts again.",
        });
        return;
      }

      await loginExternalUser(OneSignal, userId);
      setLinkSuccess(true);
      setNotice({
        severity: "success",
        text: "You’re set. We’ll only notify this phone or computer when your order is ready for pickup.",
      });
    } catch (err) {
      console.error(err);
      setLinkSuccess(false);
      setNotice({
        severity: "error",
        text: "Something went wrong while turning on alerts. Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, intentReady]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        py: 4,
        px: 2,
        background: (t) =>
          `radial-gradient(1200px 600px at 50% -10%, ${t.palette.primary.main}14, ${t.palette.grey[100]})`,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: "0 4px 24px rgba(15, 23, 42, 0.08)",
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack spacing={2.5} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>

            <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
              Order ready alerts
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
              Get a short ping when your PumpGo order is <strong>ready to pick up</strong>. We won’t use this for ads
              or spam—only your order status.
            </Typography>

            <List dense sx={{ width: "100%", textAlign: "left", py: 0 }}>
              {[
                "Open this page using the link from the PumpGo app (that way we know it’s you).",
                "Tap Get started, then Turn on alerts. If your phone or browser asks, choose Allow.",
                "You can turn alerts off anytime in your browser’s settings for this website.",
              ].map((text, i) => (
                <ListItem key={i} disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: "body2", color: "text.secondary" }} primary={text} />
                </ListItem>
              ))}
            </List>

            {userId ? (
              <Typography variant="caption" color="success.main" sx={{ alignSelf: "stretch", textAlign: "left", fontWeight: 600 }}>
                Your app link is valid — you can continue below.
              </Typography>
            ) : null}

            {notice.severity && notice.text && (
              <Alert severity={notice.severity} sx={{ width: "100%", textAlign: "left" }}>
                {notice.text}
              </Alert>
            )}

            <Stack spacing={1.5} sx={{ width: "100%" }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                disabled={loading || !userId || intentReady}
                onClick={() => {
                  setIntentReady(true);
                  const already = typeof Notification !== "undefined" && Notification.permission === "granted";
                  setNotice({
                    severity: "info",
                    text: already
                      ? "Good — notifications are already allowed here. Tap Turn on alerts to refresh this device if alerts stopped working."
                      : "Almost there — tap Turn on alerts. If a box appears, choose Allow so we can send order-ready messages.",
                  });
                }}
                sx={{ py: 1.25, fontWeight: 700, borderRadius: 2, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
              >
                {intentReady ? "You’re ready for the next step ✓" : "Get started"}
              </Button>

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !userId || !intentReady}
                onClick={runSubscribe}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? (
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                    <CircularProgress size={22} color="inherit" />
                    <span>One moment…</span>
                  </Stack>
                ) : linkSuccess ? (
                  "Turn on alerts again"
                ) : (
                  "Turn on alerts"
                )}
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5, maxWidth: 400 }}>
              Don’t see a popup? Open your browser’s settings for this website, find Notifications, and choose Allow.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
