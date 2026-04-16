import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";

const ONESIGNAL_APP_ID = "75b1e381-313b-4536-a06f-386d7b82f236";

function getUserIdFromUrl() {
  const raw = new URLSearchParams(window.location.search).get("user_id");
  if (raw == null || String(raw).trim() === "") return null;
  return String(raw).trim();
}

function waitForSubscriptionId(OneSignal, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const existing = OneSignal.User.PushSubscription.id;
    if (existing) {
      resolve(existing);
      return;
    }
    const timer = setTimeout(() => {
      OneSignal.User.PushSubscription.removeEventListener("change", onChange);
      reject(
        new Error(
          "We couldn't finish linking this device. Allow notifications and try again, or check that this site's URL is allowed in your OneSignal dashboard."
        )
      );
    }, timeoutMs);
    function onChange(event) {
      if (event.current && event.current.id) {
        clearTimeout(timer);
        OneSignal.User.PushSubscription.removeEventListener("change", onChange);
        resolve(event.current.id);
      }
    }
    OneSignal.User.PushSubscription.addEventListener("change", onChange);
  });
}

export default function NotificationPage() {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const osRef = useRef(null);

  useEffect(() => {
    const userId = getUserIdFromUrl();
    if (!userId) {
      setNotice({
        type: "warn",
        msg: "This link should include your user id (e.g. ?user_id=… from Glide). Ask for the full link or open it from the app.",
      });
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: "OneSignalSDKWorker.js",
        autoResubscribe: true,
        allowLocalhostAsSecureOrigin: isLocal,
      });
      osRef.current = OneSignal;

      if (userId) {
        try {
          await OneSignal.login(userId);
        } catch (e) {
          console.warn("OneSignal.login (user_id from URL)", e);
        }
      }
    });
  }, []);

  const handleSubscribe = useCallback(async () => {
    setNotice(null);
    const userId = getUserIdFromUrl();
    const OneSignal = osRef.current;

    if (!userId) {
      setNotice({
        type: "warn",
        msg: "Missing user id in the link. Open this page from Glide with ?user_id=… so we know who to notify.",
      });
      return;
    }

    if (!OneSignal) {
      setNotice({ type: "error", msg: "OneSignal is still loading. Please wait a moment and try again." });
      return;
    }

    if (!OneSignal.Notifications.isPushSupported()) {
      setNotice({
        type: "error",
        msg: "This browser can't use web push. Try Chrome, Edge, or Safari in a normal tab—not an in-app browser.",
      });
      return;
    }

    setLoading(true);
    let ok = false;
    try {
      await OneSignal.login(userId);
      await OneSignal.Notifications.requestPermission();
      const playerId = await waitForSubscriptionId(OneSignal, 20000);
      if (!playerId) {
        setNotice({ type: "error", msg: "Notifications weren't fully enabled. Tap again and choose Allow when prompted." });
        return;
      }
      ok = true;
      setNotice({ type: "ok", msg: "You're all set. We'll notify this device when your order is ready." });
    } catch (err) {
      console.error(err);
      setNotice({ type: "error", msg: err?.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
      if (ok) setDone(true);
    }
  }, []);

  const noticeColors = {
    warn: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
    error: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    ok: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        background: "radial-gradient(1200px 600px at 50% -10%, #e6f4f2, #f0f4f3), #f0f4f3",
        p: { xs: "24px 16px 32px", sm: "32px 24px 40px" },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(19,78,74,0.08), 0 1px 3px rgba(19,78,74,0.06)",
            p: { xs: "28px 22px 24px", sm: "32px 28px 28px" },
            textAlign: "center",
          }}
        >
          {/* Bell icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              mx: "auto",
              mb: "20px",
              bgcolor: "rgba(13,148,136,0.12)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0d9488",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </Box>

          <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", mb: 1, color: "#134e4a" }}>
            Turn on order updates
          </Typography>
          <Typography sx={{ fontSize: "1rem", color: "#5f7a76", mb: 3 }}>
            Get a push notification as soon as your PumpGo order is ready—no need to keep checking the app.
          </Typography>

          {/* Steps */}
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: "0 0 24px", textAlign: "left", fontSize: "0.9rem", color: "#5f7a76" }}>
            {[
              { n: "1", text: <><strong style={{ color: "#134e4a", fontWeight: 600 }}>Tap the button</strong> below—we'll connect this device to your account.</> },
              { n: "2", text: <>When your browser asks, choose <strong style={{ color: "#134e4a", fontWeight: 600 }}>Allow</strong> for notifications.</> },
              { n: "3", text: <>You're set. We'll only use this to send <strong style={{ color: "#134e4a", fontWeight: 600 }}>order-ready alerts</strong>.</> },
            ].map((s) => (
              <Box component="li" key={s.n} sx={{ display: "flex", gap: "12px", alignItems: "flex-start", mb: 1.5, "&:last-child": { mb: 0 } }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: "8px",
                    bgcolor: "rgba(13,148,136,0.12)",
                    color: "#0d9488",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.n}
                </Box>
                <span>{s.text}</span>
              </Box>
            ))}
          </Box>

          {/* Notice */}
          {notice && (
            <Box
              role="status"
              sx={{
                textAlign: "left",
                fontSize: "0.875rem",
                p: "12px 14px",
                borderRadius: "12px",
                mb: 2,
                lineHeight: 1.45,
                bgcolor: noticeColors[notice.type]?.bg,
                color: noticeColors[notice.type]?.color,
                border: `1px solid ${noticeColors[notice.type]?.border}`,
              }}
            >
              {notice.msg}
            </Box>
          )}

          {/* CTA */}
          <Box
            component="button"
            type="button"
            disabled={loading || done}
            onClick={handleSubscribe}
            sx={{
              width: "100%",
              py: 2,
              px: 2.5,
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: "inherit",
              color: "#fff",
              background: "linear-gradient(180deg, #0d9488 0%, #0f766e 100%)",
              border: "none",
              borderRadius: "14px",
              cursor: loading || done ? "not-allowed" : "pointer",
              boxShadow: "0 2px 12px rgba(13,148,136,0.35)",
              opacity: loading || done ? 0.65 : 1,
              transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
              "&:hover:not(:disabled)": { transform: "translateY(-1px)", boxShadow: "0 4px 16px rgba(13,148,136,0.4)" },
              "&:active:not(:disabled)": { transform: "translateY(0)" },
              "&:focus-visible": { outline: "3px solid rgba(13,148,136,0.45)", outlineOffset: "3px" },
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {loading && (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "os-spin 0.7s linear infinite",
                  "@keyframes os-spin": { to: { transform: "rotate(360deg)" } },
                }}
              />
            )}
            <span>{done ? "Notifications on" : "Enable order notifications"}</span>
          </Box>

          <Typography sx={{ mt: 2.5, fontSize: "0.8125rem", color: "#5f7a76", lineHeight: 1.5 }}>
            Uses your browser's notification permission. You can turn it off anytime in your browser settings.
          </Typography>
        </Box>

        <Typography sx={{ mt: 2.5, textAlign: "center", fontSize: "0.75rem", color: "#5f7a76", opacity: 0.85 }}>
          PumpGo
        </Typography>
      </Box>
    </Box>
  );
}
