import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/pwa/service-worker-register";
import AppProviders from "@/components/providers";
import SplashScreen from "@/components/ui/splash-screen";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  applicationName: "RESET",
  title: {
    default: "RESET",
    template: "%s | RESET",
  },
  description:
    "RESET - habit tracker and personal productivity. Build better habits, starting today.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "RESET",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2f8a60",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full bg-reset-bg text-reset-dark antialiased">
        <AppProviders>
          <SplashScreen />
          {children}
        </AppProviders>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}