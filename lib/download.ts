/**
 * Trigger a browser download (or open) of a file URL via a transient anchor.
 * Shared by the publications gate and the homepage conference push.
 */
export function triggerDownload(file: string): void {
  const a = document.createElement("a");
  a.href = file;
  a.download = "";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
