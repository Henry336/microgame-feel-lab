import { existsSync, readFileSync } from "node:fs";

const requiredFiles = ["index.html", "src/challenge.js", "src/config.js", "src/snapshots.js", "src/game.js", "src/styles.css"];
for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const html = readFileSync("index.html", "utf8");
for (const token of ["gameCanvas", "challengeReadout", "splitReadout", "snapshotStatus", "toggleSnapshotButton", "./src/game.js", "./src/styles.css"]) {
  if (!html.includes(token)) {
    throw new Error(`index.html does not reference ${token}`);
  }
}

const css = readFileSync("src/styles.css", "utf8");
if (!css.includes("@media (max-width: 900px)")) {
  throw new Error("Responsive layout media query is missing.");
}

console.log("Static app validation passed.");
