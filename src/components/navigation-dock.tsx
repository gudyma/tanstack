"use client";
import {
  ChartColumnIncreasing,
  Table2Icon,
  WarehouseIcon,
  CircleEllipsisIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Dock, DockIcon } from "@/components/ui/dock";
import { cn } from "@/lib/utils";
import MoreDrawer from "@/components/more-drawer";

import { useLocation } from "@tanstack/react-router";
import { getPathWithoutLocale } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { LocalizedLink, type To } from "./localized-link";

export function NavigationDock(props: any) {
  const { dockTankLabel, dockTableLabel, dockJournalLabel, dockMoreLabel } =
    useIntlayer("navigation-dock");
  const { pathname } = useLocation();
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return (
    <div className="fixed right-0 bottom-2 left-0 z-10 flex items-center justify-center">
      <Dock direction="middle" className="space-x-0">
        <DockIcon key="tank" className="">
          <LocalizedLink
            to={"/" as To}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-12 w-16 rounded-xl",
              "/" === pathWithoutLocale
                ? "bg-primary/10 shadow-xl dark:bg-accent-foreground/10"
                : "",
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <WarehouseIcon className="size-6" />
              <label className="font-semibold text-xs">{dockTankLabel}</label>
            </div>
          </LocalizedLink>
        </DockIcon>
        <DockIcon key="table" className="">
          <LocalizedLink
            to={"/table" as To}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-12 w-16 rounded-xl",
              "/table" === pathWithoutLocale
                ? " bg-primary/10 shadow-xl dark:bg-accent-foreground/10"
                : "",
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <Table2Icon className="size-6" />
              <label className="font-semibold text-xs">{dockTableLabel}</label>
            </div>
          </LocalizedLink>
        </DockIcon>
        <DockIcon key="journal" className="">
          <LocalizedLink
            to={"/journal" as To}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-12 w-16 rounded-xl",
              "/journal" === pathWithoutLocale
                ? " bg-primary/10 shadow-xl dark:bg-accent-foreground/10"
                : "",
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <ChartColumnIncreasing className="size-6" />
              <label className="font-semibold text-xs">
                {dockJournalLabel}
              </label>
            </div>
          </LocalizedLink>
        </DockIcon>

        <MoreDrawer>
          <DockIcon
            key="More"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              `h-12 w-16 rounded-xl`,
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <CircleEllipsisIcon className="size-6" />
              <label className="font-semibold text-xs">{dockMoreLabel}</label>
            </div>
          </DockIcon>
        </MoreDrawer>
      </Dock>
    </div>
  );
}
