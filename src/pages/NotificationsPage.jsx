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

export default function NotificationsPage() {
  const [searchParams] = useSearchParams();
  /** `user_id` from ?user_id=… (same as the old HTML page). */
  const userId = (searchParams.get("user_id") ?? "").trim() || null;

  const [notice, setNotice] = useState({ severity: null, text: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  /** Chrome (and others) penalize instant permission prompts; require an explicit intent tap first. */
  const [intentReady, setIntentReady] = useState(false);

  useEffect(() => {
    loadOneSignalScript();
  }, []);

  useEffect(() => {
    setIntentReady(false);
    if (!userId) {
      setNotice({
        severity: "warning",
        text: "This page needs ?user_id=… in the URL. Open it from your app or add your id after user_id=.",
      });
    } else {
      setNotice({ severity: null, text: "" });
    }
  }, [userId]);

  const runSubscribe = useCallback(async () => {
    if (!intentReady) {
      setNotice({
        severity: "warning",
        text: "Tap “Continue” first so Chrome knows you chose to set up alerts — then you can allow notifications.",
      });
      return;
    }

    if (!userId) {
      setNotice({
        severity: "warning",
        text: "Add your user id to the URL, for example: ?user_id=YOUR_ID (use the link from the app).",
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
          text: "This browser cannot use web push. Try Chrome, Edge, or Safari in a normal window (not an in-app browser).",
        });
        return;
      }

      let perm = browserPermission();
      if (perm === "denied") {
        setNotice({
          severity: "warning",
          text: "Notifications are blocked for this site. Allow them in your browser’s site settings for this page, then try again.",
        });
        return;
      }

      if (perm !== "granted") {
        await OneSignal.Notifications.requestPermission();
      }

      perm = browserPermission();
      if (perm !== "granted") {
        setNotice({
          severity: "warning",
          text: "Permission was not granted. Tap again and choose Allow, or enable notifications in site settings.",
        });
        return;
      }

      try {
        await optInToPushIfAvailable(OneSignal);
      } catch (e) {
        console.warn("OneSignal optIn", e);
      }

      const subId = await waitForSubscriptionId(OneSignal, 25000);
      if (!subId) {
        setNotice({
          severity: "error",
          text: "We could not finish registering this device for push. Check that this site’s URL is allowed in your OneSignal dashboard, then try again.",
        });
        return;
      }

      await loginExternalUser(OneSignal, userId);
      setDone(true);
      setNotice({
        severity: "success",
        text: "This browser is set up. We’ll send order-ready alerts here.",
      });
    } catch (err) {
      console.error(err);
      setNotice({
        severity: "error",
        text: err?.message ? String(err.message) : "Something went wrong. Please try again.",
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
              Turn on order updates
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              PumpGo only uses notifications for <strong>order-ready updates</strong> on this device. Your account is
              tied to the <strong>user_id</strong> in this page’s link — not marketing email.
            </Typography>

            <List dense sx={{ width: "100%", textAlign: "left", py: 0 }}>
              {[
                "Open this page with ?user_id=… (from your app link).",
                "Tap Continue, then Allow notifications when Chrome asks (two deliberate taps help avoid spam filters).",
                "We link this browser to that id for order alerts only. You can turn them off in site settings anytime.",
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

            {userId && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "stretch", textAlign: "left" }}>
                Current <strong>user_id</strong>: <Box component="code">{userId}</Box>
              </Typography>
            )}

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
                disabled={loading || done || !userId || intentReady}
                onClick={() => {
                  setIntentReady(true);
                  setNotice({
                    severity: "info",
                    text: "Next: tap the green button. Chrome will ask permission — choose Allow if you want order-ready alerts.",
                  });
                }}
                sx={{ py: 1.25, fontWeight: 700, borderRadius: 2, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
              >
                {intentReady ? "Step 1 done ✓" : "Continue — I want order-ready alerts"}
              </Button>

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || done || !userId || !intentReady}
                onClick={runSubscribe}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? (
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                    <CircularProgress size={22} color="inherit" />
                    <span>Working…</span>
                  </Stack>
                ) : done ? (
                  "Notifications on"
                ) : (
                  "Allow notifications in this browser"
                )}
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
              If Chrome shows a quieter prompt, open the lock icon beside the address bar → Site settings → Notifications
              → Allow.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
