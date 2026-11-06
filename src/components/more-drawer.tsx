"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { type PropsWithChildren } from "react";
import EditableTable from "@/components/editable-table";

import { ModeToggle } from "@/components/mode-toggle";
import ReportsSelection from "@/components/report-selection";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Label } from "@/components/ui/label";
import { useIntlayer } from "react-intlayer";
import GasMixtureMolarMassCalculator from "@/components/molar-mass-caluclator";

import { Cylinder, Book, Calculator, Ellipsis } from "lucide-react";

interface TankDrawerProps {
  values?: any;
}

function TankDrawerElements({ values }: { values?: any }) {
  const translation = useIntlayer("more-drawer");

  return (
    <div className="flex-col w-full h-full overflow-auto">
      <Accordion type="multiple" className="w-full" defaultValue={["density"]}>
        <AccordionItem value="density">
          <AccordionTrigger className="text-md">
            <div className="flex flex-row gap-4 px-2">
              <Cylinder />
              {translation.DensitySettingHeader}
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <EditableTable />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="report">
          <AccordionTrigger className="text-md">
            <div className="flex flex-row gap-4 px-2">
              <Book />
              {translation.ReportHeader}
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ReportsSelection />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="molar">
          <AccordionTrigger className="text-md ">
            <div className="flex flex-row gap-4 px-2">
              <Calculator />
              {translation.MolarMassHeader}
            </div>
          </AccordionTrigger>

          <AccordionContent className="flex flex-col gap-4 text-balance">
            <GasMixtureMolarMassCalculator />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="other">
          <AccordionTrigger className="text-md">
            <div className="flex flex-row gap-4 px-2">
              <Ellipsis />
              {translation.AdvancedSettingHeader}
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ModeToggle />
            <Label>{translation.ChooseLanguageLabel}</Label>
            <LocaleSwitcher />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function MoreDrawer({
  values,
  children,
}: PropsWithChildren<TankDrawerProps>) {
  const [open, setOpen] = useState(false);
  const isDesktop = !useIsMobile();
  const { dockMoreLabel } = useIntlayer("navigation-dock");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-full w-full"
        >
          {children}
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-200 sm:h-2/3"
          aria-describedby={undefined}
        >
          <DialogHeader className="p-0 m-0 hidden">
            <DialogTitle className="sr-only">{dockMoreLabel}</DialogTitle>
          </DialogHeader>
          <TankDrawerElements />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        onClick={() => setOpen(true)}
        className="flex items-center justify-center h-full w-full"
      >
        {children}
      </DrawerTrigger>
      <DrawerContent className="px-2" aria-describedby={undefined}>
        <DrawerHeader className="p-0 m-0">
          <DrawerTitle className="sr-only">{dockMoreLabel}</DrawerTitle>
        </DrawerHeader>
        <TankDrawerElements />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
