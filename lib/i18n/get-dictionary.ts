import { locales, type Locale, defaultLocale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.en),
  es: () => import("./dictionaries/es").then((m) => m.es),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const safeLocale = locales.includes(locale) ? locale : defaultLocale;
  return dictionaries[safeLocale]();
}
