#!/usr/bin/env node

// given this could be any version of node that runs this, it uses no bells or whistles...

const fs = require("fs");
const path = require("path");

const currentVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
const minVersion = Number(
    fs.readFileSync(path.join(__dirname, "../", ".nvmrc"), "utf8")
);

if (currentVersion < minVersion) {
    console.log(
        `You are using Node v${currentVersion}.\n` +
            `Frontend requires Node v${minVersion} or later.\n` +
            "If you're using NVM, you can 'nvm use'..."
    );
    process.exit(1);
}
