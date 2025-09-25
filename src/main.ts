import { getPage } from "./get.ts";
import { parsePage } from "./parse.ts";

if (Deno.args.length !== 2) {
  throw new Error("Unexpected number of arguments");
}

const [threadUrl, outputDir] = Deno.args;

console.info(`Scraping thread ${threadUrl} to directory ${outputDir}`);

let markdown = "";
let lastPageHtml: string | undefined = undefined;

for (let pageNumber = 1;; pageNumber += 1) {
  const pageHtml = await getPage(threadUrl, pageNumber);

  if (lastPageHtml === pageHtml) {
    break;
  }

  lastPageHtml = pageHtml;

  const pageMarkdown = parsePage(pageHtml);

  markdown += pageMarkdown;
}

const threadName = new URL(threadUrl).pathname.split("/").filter(Boolean).pop();
const outputPath = `${outputDir}/${threadName}.md`;

await Deno.mkdir(outputDir, { recursive: true });
await Deno.writeTextFile(outputPath, markdown);
