import { join } from "@std/path/join";

const USER_AGENT = Deno.env.get("USER_AGENT");

if (!USER_AGENT) {
  throw new Error("USER_AGENT environment variable is not set");
}

/**
 * Fetch page of thread in Subaru Community forum
 *
 * - note: returns last page for non-existent page, check manually if is equal to previous page to know when to stop!
 *
 * @param threadUrl URL of thread
 * @param pageNumber page number
 * @returns HTML of page
 */
export async function getPage(
  threadUrl: string,
  pageNumber: number,
): Promise<string> {
  const url = join(threadUrl, `index${pageNumber}.html`);

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT!,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  return html;
}
