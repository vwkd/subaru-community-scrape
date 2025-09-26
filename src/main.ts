import { delay } from "@std/async";
import { createSession, destroySession, getPage } from "./get.ts";
import { parsePage } from "./parse.ts";

const DELAY_MS_STR = Deno.env.get("DELAY_MS");

if (!DELAY_MS_STR) {
  throw new Error("DELAY_MS environment variable is not set");
}

const DELAY_MS = Number.parseInt(DELAY_MS_STR, 10);

if (Number.isNaN(DELAY_MS) || DELAY_MS < 0) {
  throw new Error("DELAY_MS environment variable must be non-negative integer");
}

if (Deno.args.length !== 2) {
  throw new Error("Unexpected number of arguments");
}

const [threadUrl, outputDir] = Deno.args;

console.info(`Scraping thread ${threadUrl} to directory ${outputDir}`);

let markdown = "";
let lastPageHtml: string | undefined = undefined;
let delayPromise = Promise.resolve();

const sessionId = await createSession();

for (let pageNumber = 1;; pageNumber += 1) {
  await delayPromise;
  delayPromise = delay(DELAY_MS);

  const pageHtml = await getPage(sessionId, threadUrl, pageNumber);

  if (lastPageHtml === pageHtml) {
    break;
  }

  lastPageHtml = pageHtml;

  const pageMarkdown = parsePage(pageHtml);

  markdown += pageMarkdown;
}

await destroySession(sessionId);

const threadName = new URL(threadUrl).pathname.split("/").filter(Boolean).pop();
const outputPath = `${outputDir}/${threadName}.md`;

await Deno.mkdir(outputDir, { recursive: true });
await Deno.writeTextFile(outputPath, markdown);
