import { $ } from "bun";
import { mkdir, copyFile } from "fs/promises";

async function build() {
    console.log("Building GUI...");
    await mkdir("dist", { recursive: true });
    await $`bun build src/gui.ts --outfile dist/gui.js --target node --external electron`;
    await copyFile("src/settings.html", "dist/settings.html");
    console.log("Build complete.");
}

build();
