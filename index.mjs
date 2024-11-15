import fs from "node:fs";
import readline from "node:readline";

const INPUT_FILE = "urls.txt";
const OUTPUT_FILE = `responses_${INPUT_FILE}.log`;

function readUrlsFromFile(filename) {
  return new Promise((resolve, reject) => {
    const urls = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filename),
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line) => {
      urls.push(line);
    });

    rl.on("close", () => {
      resolve(urls);
    });

    rl.on("error", (err) => {
      reject(err);
    });
  });
}

function getRandomDelay() {
  // Generates a random delay between 1 and 2 seconds
  return Math.floor(Math.random() * 1000) + 1000;
}

async function checkUrlsAndLogResponseCodes(urls, logFile = OUTPUT_FILE) {
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  let count = 0;
  for (const url of urls) {
    count = count + 1;
    const prefix = String(count).padStart(4, "0");

    await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));

    try {
      const response = await fetch(url);
      if (response.ok) {
        const logEntry = `${prefix}, ${url}, ${response.status}\n`;
        logStream.write(logEntry);
        console.log(logEntry);
      } else {
        throw new Error(`${prefix}, ${url}, ${response.status}`);
      }
    } catch (error) {
      const errorMessage = `${error.message}\n`;
      logStream.write(errorMessage);
      console.error(errorMessage);
    }
  }

  logStream.end();
}

(async () => {
  try {
    const urlsToCheck = await readUrlsFromFile(INPUT_FILE);
    checkUrlsAndLogResponseCodes(urlsToCheck);
  } catch (error) {
    console.error("Error reading URLs from file:", error);
  }
})();
