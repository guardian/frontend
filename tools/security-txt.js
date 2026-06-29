const fs = require("fs");
const path = require("path");

const securityTxtPath = "facia/public/security.txt";

/**
 * Generate the Expires string on June 1st next year, in the required format:
 * "Expires: YYYY-06-01T08:00:00Z"
 */
function generateExpiresString() {
  const now = new Date();

  const nextYear = now.getUTCFullYear() + 1;

  const expiresDate = new Date(Date.UTC(nextYear, 5, 1, 8, 0, 0)); // Month is 0-indexed (5 = June)
  const isoWithMilliseconds = expiresDate.toISOString();
  const isoString = isoWithMilliseconds.replace(".000Z", "Z"); // Remove milliseconds

  console.log(`Next Expires date: ${isoString}`);
  return `Expires: ${isoString}`;
}

function updateExpiresField(filePath) {
  const absolutePath = path.resolve(filePath);
  const expiresLine = generateExpiresString();

  let lines = [];

  try {
    const fileContent = fs.readFileSync(absolutePath, "utf8");
    lines = fileContent.split("\n");
  } catch (err) {
    console.error(`Error reading file: ${absolutePath}`);
    console.error(err.message);
    process.exit(1);
  }

  let found = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Expires:")) {
      lines[i] = expiresLine; // Replace the Expires line if it exists
      found = true;
      break;
    }
  }

  if (!found) {
    lines.push(expiresLine); // Add Expires field if not present
  }

  try {
    fs.writeFileSync(absolutePath, lines.join("\n"), "utf8");
  } catch (err) {
    console.error(`Error writing file: ${absolutePath}`);
    console.error(err.message);
    process.exit(1);
  }
}

updateExpiresField(securityTxtPath);
