import { delay } from "@std/async";
import { Command } from "@cliffy/command";
import { createSession, destroySession, getPage } from "./get.ts";
import { parsePage } from "./parse.ts";
import type { Options } from "./types.ts";

const DELAY_MS_STR = Deno.env.get("DELAY_MS");

if (!DELAY_MS_STR) {
  throw new Error("DELAY_MS environment variable is not set");
}

const DELAY_MS = Number.parseInt(DELAY_MS_STR, 10);

if (Number.isNaN(DELAY_MS) || DELAY_MS < 0) {
  throw new Error("DELAY_MS environment variable must be non-negative integer");
}

await new Command()
  .name("subaru-community-scrape")
  .version("0.0.1")
  .description("Scrape thread from Subaru Community forum")
  .option("-u, --url <url:string>", "Thread URL", { required: true })
  .option("-o, --out <path:file>", "Output directory", { required: true })
  .action(main)
  .parse(Deno.args);

/**
 * Scrape thread from Subaru Community forum
 *
 * @param options Options
 */
export async function main(options: Options) {
  const { url, out } = options;

  console.info(`Scraping thread ${url} to directory ${out}`);

  let markdown = "";
  let lastPageMarkdown: string | undefined = undefined;
  let delayPromise = Promise.resolve();

  const sessionId = await createSession();

  for (let pageNumber = 1;; pageNumber += 1) {
    await delayPromise;
    delayPromise = delay(DELAY_MS);

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
