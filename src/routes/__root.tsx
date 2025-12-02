import { type ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import CSS from "@/style.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
      {},
    ],

    links: [
      {
        rel: "stylesheet",
        href: CSS,
      },
      // Standard Favicons
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
        sizes: "48x48",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },

      // PNG Favicons (Multiple Sizes)
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/favicon-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/favicon-512x512.png",
      },

      // Apple Touch Icons
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicon-180x180.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "152x152",
        href: "/favicon-152x152.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "120x120",
        href: "/favicon-120x120.png",
      },

      // Safari Pinned Tab
      {
        rel: "mask-icon",
        href: "/favicon.svg",
        color: "#000000",
      },

      // Web App Manifest
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
    // Fallback for no-JS
    noscript: [
      {
        children: `<link rel="stylesheet" href="${CSS}">`,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex h-screen w-full relative bg-background ">
          {/* Cool Blue Glow Top */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
                radial-gradient(
                  circle at top center,
                  var(--background-blur),
                  transparent 70%
                )
              `,
              filter: "blur(80px)",
              backgroundRepeat: "no-repeat",
            }}
          />
          {children}
        </div>
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
