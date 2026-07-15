import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { RouteChangeSpinner } from "@/components/route-change-spinner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | RegiParc - Gestion du Parc Informatique",
    default: "RegiParc - Gestion du Parc Informatique",
  },
  description:
    "Tableau de bord de gestion du parc informatique : équipements, employés, affectations et maintenances.",
  icons: {
    icon: [{ url: "/logo-regideso.png", type: "image/png" }],
    shortcut: "/logo-regideso.png",
    apple: "/logo-regideso.png",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <RouteChangeSpinner />

          {children}

          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={5000}
            toastOptions={{
              className: "dark:bg-gray-dark dark:border-dark-3 dark:text-white",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
