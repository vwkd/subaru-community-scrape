import { createSession, destroySession, getPage } from "./get.ts";
import { parsePage } from "./parse.ts";
import type { Options } from "./types.ts";

/**
 * Scrape thread from Subaru Community forum
 *
 * @param options Options
 */
export async function scrape(options: Options) {
  const { url, out } = options;

  console.info(`Scraping thread ${url} to directory ${out}`);

  let markdown = "";
  let lastPageMarkdown: string | undefined = undefined;

  const sessionId = await createSession();

  for (let pageNumber = 1;; pageNumber += 1) {
    const pageHtml = await getPage(sessionId, url, pageNumber);

    const pageMarkdown = parsePage(pageHtml);

    if (lastPageMarkdown === pageMarkdown) {
      break;
    }

    lastPageMarkdown = pageMarkdown;

    markdown += pageMarkdown;
  }

  await destroySession(sessionId);

  const threadName = new URL(url).pathname.split("/").filter(Boolean)
    .pop();
  const outputPath = `${out}/${threadName}.md`;

  await Deno.mkdir(out, { recursive: true });
  await Deno.writeTextFile(outputPath, markdown);
}
