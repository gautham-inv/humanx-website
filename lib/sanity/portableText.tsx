import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { sanityImageUrl } from "@/lib/sanity/image-loader";
import type { PortableTextBlock } from "@/lib/sanity/queries";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-serif text-base leading-relaxed text-ink-dim md:text-lg">
        {children}
      </p>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={(value?.href as string) || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 hover:text-accent-bright"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const url = value?.imageUrl as string | undefined;
      if (!url) return null;
      return (
        <img
          src={sanityImageUrl(url, 900)}
          alt={(value?.alt as string) || ""}
          width={(value?.imageWidth as number) || undefined}
          height={(value?.imageHeight as number) || undefined}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl border border-line object-cover"
        />
      );
    },
  },
};

/**
 * Renders an insight's Portable Text body with the site's article styling.
 * Wrap in the caller's own spacing/`Reveal` — this only owns per-block
 * typography, not the surrounding layout.
 */
export function InsightBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="space-y-5">
      <PortableText value={value} components={components} />
    </div>
  );
}

/**
 * Flattens Portable Text blocks into plain text — used for reading time,
 * meta descriptions, and JSON-LD descriptions. Non-text blocks (e.g.
 * images) are skipped.
 */
export function portableTextToPlainText(blocks: PortableTextBlock[]): string {
  return blocks
    .filter((b) => b._type === "block")
    .map((b) => {
      const spans = (b.children as Array<{ text?: string }> | undefined) ?? [];
      return spans.map((s) => s.text ?? "").join("");
    })
    .join("\n\n");
}
