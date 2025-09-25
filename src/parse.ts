import { DOMParser } from "@b-fuze/deno-dom";
import TurndownService from "turndown";

const POST_SELECTOR =
  "body#tplThread > div#mainContainer > div#main > div#splitter > div#secondSplit > div.message";
const AUTHOR_SELECTOR = "div.messageSidebar div.messageAuthor p.userName";
const ANCHOR_SELECTOR =
  "div.messageContent div.messageHeader > p.messageCount > a.messageNumber";
const DATETIME_SELECTOR =
  "div.messageContent div.messageHeader > div.containerContent > p";
const TITLE_SELECTOR = "div.messageContent h3.messageTitle";
const BODY_SELECTOR = "div.messageContent div.messageBody";

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

/**
 * Parse page of thread in Subaru Community forum
 *
 * @param pageHtml HTML of page
 * @returns markdown of page
 */
export function parsePage(pageHtml: string): string {
  const doc = new DOMParser().parseFromString(pageHtml, "text/html");

  const posts = doc.querySelectorAll(POST_SELECTOR);

  if (!posts.length) {
    throw new Error("No posts found");
  }

  let pageMarkdown = "";

  for (const post of posts) {
    const authorElement = post.querySelector(AUTHOR_SELECTOR);

    if (!authorElement) {
      throw new Error("No author element found");
    }

    const author = authorElement.textContent.trim();

    const anchorElement = post.querySelector(ANCHOR_SELECTOR);

    if (!anchorElement) {
      throw new Error("No anchor element found");
    }

    const count = anchorElement.textContent.trim();
    const url = anchorElement.getAttribute("href");

    const dateElement = post.querySelector(DATETIME_SELECTOR);

    if (!dateElement) {
      throw new Error("No date element found");
    }

    const date = dateElement.textContent.trim();

    const titleElement = post.querySelector(TITLE_SELECTOR);

    if (!titleElement) {
      throw new Error("No title element found");
    }

    const title = titleElement.textContent.trim();

    const bodyElement = post.querySelector(BODY_SELECTOR);

    if (!bodyElement) {
      throw new Error("No body element found");
    }

    const body = bodyElement.innerHTML;
    const bodyMarkdown = cleanMarkdown(turndownService.turndown(body));

    pageMarkdown += `## ${author} — ${date} — [${count}](${url})\n\n`;
    if (title) pageMarkdown += `### ${title}\n\n`;
    pageMarkdown += `${bodyMarkdown}\n\n`;
  }

  return pageMarkdown;
}

/**
 * Clean markdown
 *
 * - remove smily images
 * - remove quote images
 * - remove warning images
 */
function cleanMarkdown(markdown: string): string {
  return markdown
    // `![:(](wcf/images/smilies/sad.png)` -> `:(`
    .replaceAll(/!\[([^\]]+)\]\(wcf\/images\/smilies\/[^/]+\.png\)/g, "$1")
    // remove `![](wcf/icon/quoteS.png)`
    .replaceAll(/!\[\]\(wcf\/icon\/quoteS\.png\)/g, "")
    // remove `![Clubinterner Text](wcf/icon/warningS.png)`
    .replaceAll(/!\[[^\]]+\]\(wcf\/icon\/warningS\.png\)/g, "")
    .trim();
}
