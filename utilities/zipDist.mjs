import { zip } from "zip-a-folder";
import { mkdirSync } from "fs";

async function main() {
  mkdirSync("./.upload");
  await zip("./.dist", "./.upload/main.zip");
}

main();
