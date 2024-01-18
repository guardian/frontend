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

const checkNodeEnv = async () => {
	// check node
	const nvmrcVersion = fs
		.readFileSync(path.join(__dirname, '../', '.nvmrc'), 'utf8')
		.trim();
	await checkVersion('node', nvmrcVersion);
	logSuccess(`Node ${nvmrcVersion}`);

	// check package manager
	childProcess.exec('pnpm --version', async (e, version) => {
		if (!e) return;

		logFail(`PNPM not found!`);
		console.log(
			`Enabling PNPM via corepack ${expectedPackageManagerVersion} via npm`,
		);

		childProcess
			.spawn('corepack', ['enable'], {
				stdio: 'inherit',
			})
			.on('close', (code) => {
				if (code !== 0) process.exit(code);
			});
	});
};

checkNodeEnv();
