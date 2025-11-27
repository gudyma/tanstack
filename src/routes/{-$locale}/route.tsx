import { createFileRoute, Outlet } from "@tanstack/react-router";
import { IntlayerProvider, useLocale } from "react-intlayer";
import { useI18nHTMLAttributes } from "@/hooks/useI18nHTMLAttributes";
import { NavigationDock } from "@/components/navigation-dock";

export const Route = createFileRoute("/{-$locale}")({
  ssr: "data-only",
  component: RouteComponent,
});

function RouteComponent() {
  const { locale } = Route.useParams();
  const { defaultLocale } = useLocale();

  useI18nHTMLAttributes();

  return (
    <IntlayerProvider locale={locale ?? defaultLocale}>
      <Outlet />
      <NavigationDock />
    </IntlayerProvider>
  );
}
