import { join } from "@std/path/join";

const FLARESOLVERR_URL = "http://localhost:8191/v1";
const HEADERS = { "Content-Type": "application/json" };

/**
 * Fetch page of thread in Subaru Community forum
 *
 * - uses FlareSolverr to bypass Cloudflare
 * - note: returns last page for non-existent page, check manually if is equal to previous page to know when to stop!
 *
 * @param sessionId FlareSolverr session ID
 * @param threadUrl URL of thread
 * @param pageNumber page number
 * @returns HTML of page
 */
export async function getPage(
  sessionId: string,
  threadUrl: string,
  pageNumber: number,
): Promise<string> {
  console.debug(`Fetching page ${pageNumber}`);

  const url = join(threadUrl, `index${pageNumber}.html`);

  const res = await fetch(FLARESOLVERR_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      cmd: "request.get",
      url: url,
      session: sessionId,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status !== "ok") {
    throw new Error(`Failed to fetch page: ${data.message}`);
  }

  if (!data.solution.status == 200) {
    throw new Error(`Failed to fetch page: ${data.solution.status}`);
  }

  const html = data.solution.response;

  return html;
}

/**
 * Create FlareSolverr session
 *
 * @returns session ID
 */
export async function createSession(): Promise<string> {
  const res = await fetch(FLARESOLVERR_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      cmd: "sessions.create",
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status !== "ok") {
    throw new Error(`Failed to create session: ${data.message}`);
  }

  const sessionId = data.session;

  return sessionId;
}

/**
 * Destroy FlareSolverr session
 *
 * @param sessionId session ID
 */
export async function destroySession(sessionId: string): Promise<void> {
  const res = await fetch(FLARESOLVERR_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      cmd: "sessions.destroy",
      session: sessionId,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status !== "ok") {
    throw new Error(`Failed to destroy session: ${data.message}`);
  }
}
