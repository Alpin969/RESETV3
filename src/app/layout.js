import { Roboto } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/pwa/service-worker-register";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata = {
  applicationName: "RESET",
  title: {
    default: "RESET",
    template: "%s | RESET",
  },
  description:
    "RESET - habit tracker dan personal productivity. Bangun kebiasaan baik, mulai dari hari ini.",
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
  themeColor: "#23845B",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${roboto.variable} h-full`}>
      <body className="min-h-full bg-reset-bg text-reset-dark antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}