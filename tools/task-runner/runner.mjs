#!/usr/bin/env node

// force any plugins that use `chalk` to output in full colour
process.env.FORCE_COLOR = true;

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Listr } from 'listr2';
import chalk from 'chalk';
import figures from 'figures';
import uniq from 'lodash.uniq';
import { VerboseRenderer } from './run-task-verbose-formater.mjs';

// name of the tasks directory
const tasksDirectory = '__tasks__';

// use yargs to get a useful CLI
const {
	debug: IS_DEBUG,
	verbose: IS_VERBOSE,
	stdout: IS_STDOUT,
	_: TASKS,
} = yargs(hideBin(process.argv))
	.option('debug', {
		demand: false,
		describe: 'Log everything there is to log.',
		type: 'boolean',
		nargs: 0,
	})
	.option('verbose', {
		demand: false,
		describe:
			'Log everything there is to log with a simple format for the output.',
		type: 'boolean',
		nargs: 0,
	})
	.option('stdout', {
		demand: false,
		describe:
			'Log all stdout once the tasks are finished (errors are logged by default).',
		type: 'boolean',
		nargs: 0,
	})
	.usage('Usage: $0 <task> [<task>] [--dev]')
	.command('task', `Run a task defined in '${tasksDirectory}'.`)
	.example('$0 copy/index.js', 'Run all the copy tasks.')
	.example('$0 javascript/copy.js', 'Run the javascript copy task.')
	.example('$0 compile/index.dev.js', 'Run the compile dev copy task.')
	.example(
		'$0 compile/javascript/copy.js compile/css/copy.js',
		'Run the javascript copy and css copy tasks.',
	)
	.demand(1)
	.help()
	.alias('h', 'help')
	.version()
	.alias('v', 'version').argv;

// if this is true, we log as much as we can
const VERBOSE = IS_VERBOSE || IS_DEBUG;

// look here for tasks that come in from yargs
const taskSrc = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
	tasksDirectory,
);

/**
 * resolve the tasks from yargs to actual files
 */
const getTasksFromModule = async (taskName) => {
	try {
		const modulePath = path.resolve(taskSrc, taskName);
		return (await import(modulePath)).default;
	} catch (e) {
		// we can't find any modules, or something else has gone wrong in resolving it
		// so output an erroring task
		return {
			description: `${chalk.red(taskName)} failed:`,
			task: () => Promise.reject(e),
		};
	}
};

/** get a list of the tasks we're going to run */
const taskModules = await Promise.all(TASKS.map(getTasksFromModule));

// run them!
new Listr(taskModules, {
	collapse: true,
	renderer: IS_VERBOSE ? VerboseRenderer : 'default',
	concurrent: VERBOSE ? false : true,
})
	.run({
		// we're adding these to the [listr context](https://listr2.kilic.dev/listr/context.html)
		messages: [],
		stdouts: [],
		verbose: VERBOSE,
	})
	.catch((e) => {
		// something went wrong, so log whatever we have
		if (!e.stderr && !e.stdout) console.log(e);
		if (e.stderr) console.error(`\n${e.stderr.trim()}`);
		if (e.stdout) console.log(`\n${e.stdout.trim()}`);
		return Object.assign(e.context, { error: true });
	})
	.then((ctx) => {
		if (IS_STDOUT)
			ctx.stdouts.forEach((stdout) =>
				console.log(stdout.toString().trim()),
			);

		if (ctx.messages.length) {
			console.log('');
			uniq(ctx.messages).forEach((message) =>
				console.log(
					chalk.dim(
						`${figures.arrowRight} ${message
							.split('\n')
							.join('\n  ')}`,
					),
				),
			);
		}

		if (ctx.error) {
			console.log('');
			// if something's gone wrong, fail hard
			process.exit(1);
		}
	});
