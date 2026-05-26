import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
import { Hero } from "@/components/sections/Hero";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { Assessment } from "@/components/sections/Assessment";
import { Events } from "@/components/sections/Events";
import { OnStage } from "@/components/sections/OnStage";
import { PartnersTicker } from "@/components/sections/PartnersTicker";
import { Testimonials } from "@/components/sections/Testimonials";
import { GlobalCTA } from "@/components/sections/GlobalCTA";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <main id="main">
      <Hero dict={dict} locale={locale} />
      <WhoWeAre dict={dict} />
      <Assessment dict={dict} />
      <Events dict={dict} locale={locale} />
      <OnStage dict={dict} />
      <PartnersTicker dict={dict} />
      <Testimonials dict={dict} />
      <GlobalCTA dict={dict} variant="home" />
    </main>
  );
}
