import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";
import "../styles/onboarding.css";

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
