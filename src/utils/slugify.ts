/**
 * Converts a product name into a clean, URL-safe slug.
 * Example: "Kaju Katli (500g)" → "kaju-katli-500g"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars except hyphens
    .replace(/[\s_]+/g, '-')    // spaces/underscores → hyphens
    .replace(/-+/g, '-')        // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');   // strip leading/trailing hyphens
}
