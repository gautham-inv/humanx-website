import { Fragment } from "react";

/**
 * Renders an h1/h2 heading where one or more words are wrapped in `<<…>>`
 * markers in the source string, rendering those words in the brand
 * highlight font (serif italic) — same colour as the surrounding text.
 *
 *   <HighlightedTitle as="h1" className="font-display text-6xl">
 *     {"Six practices, <<one>> through-line."}
 *   </HighlightedTitle>
 *
 * Locale-friendly: each translation can put the marker around a different
 * word, since the source string itself carries the position.
 */
type Props = {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

// Matches <<anything-not-greedy>>. Capturing group gives us the inner word.
const HIGHLIGHT_RE = /<<([^>]+?)>>/g;

export function HighlightedTitle({
  children,
  className = "",
  as: As = "h1",
}: Props) {
  // Split alternates between plain text and highlighted captures:
  // "abc <<word>> def" → ["abc ", "word", " def"]
  const parts = children.split(HIGHLIGHT_RE);

  return (
    <As className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className="font-highlight italic"
            style={{ fontFamily: "var(--font-highlight)" }}
          >
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </As>
  );
}
