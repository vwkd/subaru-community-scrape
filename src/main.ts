import { Command } from "@cliffy/command";
import { scrape } from "./scrape.ts";

await new Command()
  .name("subaru-community-scrape")
  .version("0.0.1")
  .description("Scrape thread from Subaru Community forum")
  .option("-u, --url <url:string>", "Thread URL", { required: true })
  .option("-o, --out <path:file>", "Output directory", { required: true })
  .action(scrape)
  .parse(Deno.args);
