/**
 * Renders one or more Schema.org objects as <script type="application/ld+json">
 * tags. Server component — the JSON is serialized at build time and shipped in
 * the static HTML so crawlers and AI engines read it without executing JS.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
