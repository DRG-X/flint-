import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth, useUser } from "@clerk/nextjs";
import { useUserProfile } from "../hooks/useUserProfile";
import { syncUser } from "../lib/api";
import Head from "next/head";

export default function PostAuth() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { checkStatus } = useUserProfile();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push("/auth"); return; }
    if (!user || !user.id) return;   // wait for user object to hydrate

    const routeUser = async () => {
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        setErrorMsg("Server is taking too long. Please try again.");
      }, 10000);

      try {
        // Retry getToken up to 3 times with 500ms delay — new OAuth sessions
        // need an extra tick before the token is available
        let token = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          token = await getToken();
          if (token) break;
          await new Promise(r => setTimeout(r, 500));
        }

        if (!token) {
          clearTimeout(timeoutId);
          setErrorMsg("Could not authenticate. Please try signing in again.");
          return;
        }

        await syncUser(token, {
          clerk_id:  user.id,
          email:     user.primaryEmailAddress?.emailAddress || "",
          full_name: user.fullName || user.username || "",
        });

        const { exists, is_onboarded } = await checkStatus();
        clearTimeout(timeoutId);
        if (isTimedOut) return;

        if (exists && is_onboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (!isTimedOut) {
          setErrorMsg(err.message || "Failed to set up your account. Please try again.");
        }
      }
    };

    routeUser();
  }, [isLoaded, isSignedIn, user]);

  return (
    <>
      <Head>
        <title>Loading... — Vaulto</title>
      </Head>
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center text-[var(--text)]">
        {errorMsg ? (
          <div className="text-center animate-fade-in max-w-md w-full px-5">
            <div className="error-box">{errorMsg}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary mt-2"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="loading-box animate-pulse-glow">
            <div className="mb-6 flex justify-center logo">
              <span className="logo-mark">V</span><span>Vaulto</span>
            </div>
            <div className="spinner"></div>
            <p className="mt-4 text-[var(--muted)] text-sm tracking-wider uppercase font-semibold">Preparing your Vaulto</p>
          </div>
        )}
      </div>
    </>
  );
}

