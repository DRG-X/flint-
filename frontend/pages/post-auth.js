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

    if (!isSignedIn) {
      router.push("/auth");
      return;
    }

    const routeUser = async () => {
      try {
        // 1. Ensure user row exists in DB (safe to call repeatedly — idempotent)
        await syncUser({
          clerk_id:  user?.id || "",
          email:     user?.primaryEmailAddress?.emailAddress || "",
          full_name: user?.fullName || user?.username || "",
        });

        // 2. Check if onboarding is complete
        const { exists } = await checkStatus();
        if (exists) {
          // Returning user with a profile → go to dashboard
          router.push("/dashboard");
        } else {
          // New user — start onboarding
          router.push("/onboarding");
        }
      } catch (err) {
        setErrorMsg(err.message || "Failed to set up your account. Please try again.");
      }
    };

    routeUser();
  }, [isLoaded, isSignedIn, user, checkStatus, router]);

  return (
    <>
      <Head>
        <title>Loading... — Flint</title>
      </Head>
      <div className="min-h-screen bg-[#06080d] flex flex-col items-center justify-center text-[#e8ecf4]">
        {errorMsg ? (
          <div className="text-center animate-fade-in">
            <div className="text-red-400 mb-4 text-sm">{errorMsg}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-cyan-500/10 text-cyan-400 text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-cyan-500/20 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-pulse-glow">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-6">
              ⚡
            </div>
            <div className="w-6 h-6 border-2 border-[#243049] border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-[#556078] text-sm tracking-wider uppercase font-semibold">Preparing your Flint</p>
          </div>
        )}
      </div>
    </>
  );
}

