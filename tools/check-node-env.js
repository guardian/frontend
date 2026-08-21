#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const checkVersion = (target, semver) =>
	new Promise((resolve) => {
		// https://www.npmjs.com/package/check-node-version
		childProcess
			.spawn(
				'npx',
				['-y', 'check-node-version', `--${target}`, `${semver}`],
				{
					stdio: 'inherit',
				},
			)
			.on('close', (code) => {
				// quit the process if the version check fails
				// check-node-version will output an error message
				if (code !== 0) process.exit(code);
				resolve(true);
			})
			.on('error', () => {
				process.exit(code);
			});
	});

const logSuccess = (msg) => console.log(`\x1b[32m✔\x1b[0m ${msg}`);

const logFail = (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`);

// Tool versions are pinned in .tool-versions, which is read by mise.
// See https://mise.jdx.dev/configuration.html#tool-versions
const TOOL_VERSIONS_PATH = path.join(__dirname, '../', '.tool-versions');

const getToolVersion = (tool) => {
	const line = fs
		.readFileSync(TOOL_VERSIONS_PATH, 'utf8')
		.split('\n')
		.map((l) => l.replace(/#.*$/, '').trim())
		.find((l) => l.split(/\s+/)[0] === tool);

	if (!line) {
		logFail(`No \`${tool}\` entry found in .tool-versions`);
		process.exit(1);
	}

	return line.split(/\s+/)[1];
};

const checkNodeEnv = async () => {
	// check node
	const nodeVersion = getToolVersion('node');
	await checkVersion('node', nodeVersion);
	logSuccess(`Node ${nodeVersion}`);

	// check yarn
	childProcess.exec('yarn --version', async (e, version) => {
		const foundYarnVersion = version.trim();
		const enginesYarnVersion = require('../package.json').engines.yarn;

		if (foundYarnVersion) {
			await checkVersion('yarn', enginesYarnVersion);
			logSuccess(`Yarn ${foundYarnVersion}`);
		} else {
			// else install yarn with npm (mainly for TeamCity)
			logFail(`Yarn not found!`);
			console.log(`Installing yarn ${enginesYarnVersion} via npm`);
			childProcess
				.spawn('npm', ['i', '-g', `yarn@${enginesYarnVersion}`], {
					stdio: 'inherit',
				})
				.on('close', (code) => {
					if (code !== 0) process.exit(code);
				});
		}
	});
};

checkNodeEnv();
