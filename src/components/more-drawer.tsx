"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
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

interface TankDrawerProps {
  values?: any;
}

function TankDrawerElements({ values }: { values?: any }) {
  return (
    <div className="flex-col w-full h-full overflow-auto">
      <Accordion
        type="multiple"
        className="w-full pt-4"
        defaultValue={["density"]}
      >
        <AccordionItem value="density">
          <AccordionTrigger className="text-md">
            Налаштування густини продукту
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <EditableTable />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="report">
          <AccordionTrigger className="text-md">Звіти</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ReportsSelection />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="other">
          <AccordionTrigger className="text-md">
            Додаткові налаштування
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <ModeToggle />
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

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-full w-full"
        >
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] h-2/3">
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
      <DrawerContent className="p-2">
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
