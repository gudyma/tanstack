import { useLocation } from "@tanstack/react-router";
import {
  getHTMLTextDir,
  getLocaleName,
  getPathWithoutLocale,
  getPrefix,
} from "intlayer";
import type { FC } from "react";
import { setLocaleInStorage, useIntlayer, useLocale } from "react-intlayer";
import { LocalizedLink, type To } from "./localized-link";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

export const LocaleSwitcher: FC = () => {
  const { localeSwitcherLabel } = useIntlayer("locale-switcher");
  const { pathname } = useLocation();

  const { availableLocales, locale } = useLocale();

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  return (
    <ol className="divide-text/20 divide-y divide-dashed rounded-2xl overflow-y-auto p-1">
      {availableLocales.map((localeEl) => (
        <li className="py-1" key={localeEl}>
          <LocalizedLink
            aria-current={localeEl === locale ? "page" : undefined}
            aria-label={
              localeSwitcherLabel({ language: getLocaleName(localeEl) }).value
            }
            onClick={() => setLocaleInStorage(localeEl)}
            params={{ locale: getPrefix(localeEl).localePrefix }}
            to={pathWithoutLocale as To}
          >
            <div
              className={cn(
                "flex flex-row items-center hover:bg-muted rounded-md justify-between gap-3 px-2 py-1",
                localeEl === locale ? "border" : "",
              )}
            >
              <div className="flex flex-col text-nowrap">
                <span
                  className="flex flex-row"
                  dir={getHTMLTextDir(localeEl)}
                  lang={localeEl}
                >
                  {localeEl === locale ? (
                    <CheckIcon size={20} className="mr-2" />
                  ) : null}
                  {getLocaleName(localeEl)}{" "}
                </span>
              </div>
              <span className="text-neutral text-sm text-nowrap">
                {localeEl.toUpperCase()}
              </span>
            </div>
          </LocalizedLink>
        </li>
      ))}
    </ol>
  );
};
