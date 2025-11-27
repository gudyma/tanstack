// src/routes/__root.tsx
/// <reference types="vite/client" />
import { useEffect, type ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import CSS from "@/style.css?url";

const criticalCSS = `
  @font-face{font-family:"Inter Tight";font-style:normal;font-display:swap;font-weight:600;src:url("/assets/inter-tight-cyrillic-600-normal-BERwQ0yl.woff2") format("woff2"),url("/assets/inter-tight-cyrillic-600-normal-BeTasGgk.woff") format("woff");unicode-range:U+301,U+400-45F,U+490-491,U+4B0-4B1,U+2116}@keyframes spin{100%{transform:rotate(360deg)}}@keyframes enter{0%{opacity:var(--tw-enter-opacity,1);transform:translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0)scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1))rotate(var(--tw-enter-rotate,0));filter:blur(var(--tw-enter-blur,0))}}@keyframes exit{100%{opacity:var(--tw-exit-opacity,1);transform:translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0)scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1))rotate(var(--tw-exit-rotate,0));filter:blur(var(--tw-exit-blur,0))}}@keyframes accordion-down{0%{height:0px}100%{height:0px}}@keyframes accordion-up{0%{height:var(--radix-accordion-content-height,var(--bits-accordion-content-height,var(--reka-accordion-content-height,var(--kb-accordion-content-height,var(--ngp-accordion-content-height,auto)))))}}:root{--radius:.625rem;--background:#fff;--foreground:#0a0a0a;--card:#fff;--card-foreground:#0a0a0a;--popover:#fff;--popover-foreground:#0a0a0a;--primary:#171717;--primary-foreground:#fafafa;--secondary:#f5f5f5;--secondary-foreground:#171717;--muted:#f5f5f5;--muted-foreground:#737373;--accent:#f5f5f5;--accent-foreground:#171717;--destructive:#e40014;--border:#e5e5e5;--input:#e5e5e5;--ring:#a1a1a1;--chart-1:#f05100;--chart-2:#009588;--chart-3:#104e64;--chart-4:#fcbb00;--chart-5:#f99c00;--sidebar:#fafafa;--sidebar-foreground:#0a0a0a;--sidebar-primary:#171717;--sidebar-primary-foreground:#fafafa;--sidebar-accent:#f5f5f5;--sidebar-accent-foreground:#171717;--sidebar-border:#e5e5e5;--sidebar-ring:#a1a1a1;--background-blur:#1447e626}:root{font-family:"Inter Tight",system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}
`;

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
    // Inline critical CSS
    scripts: [
      {
        innerHTML: `
          const s=document.createElement('style');
          s.textContent=${JSON.stringify(criticalCSS)};
          document.head.appendChild(s);
        `,
      },
    ],
    links: [
      {
        rel: "preload",
        onload: "this.onload=null;this.rel='stylesheet'",
        href: CSS,
        as: "style",
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
  useEffect(() => {
    // Apply preloaded stylesheet immediately
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS;
    document.head.appendChild(link);
  }, []);
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
