// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import "@/style.css";

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
    links: [{ rel: "icon", href: "/favicon.svg" }],
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
