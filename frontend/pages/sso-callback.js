import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  // This component automatically handles the session creation 
  // after Google redirects back with the user credential.
  return <AuthenticateWithRedirectCallback signInForceRedirectUrl="/post-auth" signUpForceRedirectUrl="/post-auth" signInFallbackRedirectUrl="/post-auth" signUpFallbackRedirectUrl="/post-auth" />;
}
