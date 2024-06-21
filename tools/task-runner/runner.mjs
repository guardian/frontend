#!/usr/bin/env node
/* eslint-disable import/no-dynamic-require, global-require */

// force any plugins that use `chalk` to output in full colour
import { fileURLToPath } from 'node:url';

process.env.FORCE_COLOR = true;

import path from 'node:path';
import os from 'node:os';

import yargs from 'yargs';
import { Listr } from 'listr2';
import execa from 'execa';
import chalk from 'chalk';
import figures from 'figures';
import uniq from 'lodash.uniq';
import { hideBin } from 'yargs/helpers';

// name of the tasks directory
const tasksDirectory = '__tasks__';

// use yargs to get a useful CLI
const {
	dev: IS_DEV,
	debug: IS_DEBUG,
	verbose: IS_VERBOSE,
	stdout: IS_STDOUT,
	_: TASKS,
} = yargs(hideBin(process.argv))
	.option('dev', {
		demand: false,
		describe: 'Prefer the dev version of the task, if it exits.',
		type: 'boolean',
		nargs: 0,
	})
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
	.example('$0 copy', 'Run all the copy tasks.')
	.example('$0 javascript/copy', 'Run the javascript copy task.')
	.example(
		'$0 javascript/copy --dev',
		'Run the javascript copy task, and prefer the development version, if it exists.',
	)
	.example(
		'$0 javascript/copy css/copy --dev',
		'Run the javascript and css copy tasks, and prefer the development versions, if they exist.',
	)
	.demand(1)
	.help()
	.alias('h', 'help') // eslint-disable-line newline-per-chained-call
	.version()
	.alias('v', 'version').argv; // eslint-disable-line newline-per-chained-call

// if this is true, we log as much as we can
const VERBOSE = IS_VERBOSE || IS_DEBUG;

// look here for tasks that come in from yargs
const taskSrc = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
	tasksDirectory,
);

// we will store tasks that we run in here, to prevent running them more than once
// e.g. if two tasks rely on the same thing
const cache = [];

// use exaca to run simple terminal commands
const exec = (task, onError, ctx) => {
	const [cmd, ...args] = task.trim().split(' ');

	return execa(cmd, args)
		.then((result) => {
			// store any stdout incase we need it later
			if (result.stdout) ctx.stdouts.push(result.stdout);
		})
		.catch((e) => {
			// if the task supplies an `onError` function, run it
			if (typeof onError === 'function') onError(ctx);
			// continue with a fake rejected promise
			return Promise.reject(e);
		});
};

const getCpuCount = () => os.cpus().length;

// turn a list of our tasks into objects listr can use
function listrify(steps, { concurrent = false } = {}) {
	const listrTasks = steps.map((step) => {
		const {
			description: title,
			task,
			concurrent: isConcurrent,
			onError,
		} = step;

		// if another task has included this one, don't run it again
		const skip =
			cache.indexOf(step) !== -1
				? () => 'Skipping: already run by another task'
				: false;
		cache.push(step);

		// if the task is a set of subtasks, prepare them
		if (Array.isArray(task)) {
			return {
				title,
				task: () =>
					listrify(
						task.map((_task) => {
							if (_task.task) return _task;
							if (typeof _task === 'string')
								return {
									title,
									task: (ctx) => exec(_task, onError, ctx),
									skip,
								};
							return { title, task: _task, skip };
						}),
						{
							concurrent: VERBOSE
								? false
								: isConcurrent
								? getCpuCount()
								: false,
						},
					),
				skip,
			};
		}

		// treat tasks that are strings as terminal commands
		if (typeof task === 'string')
			return { title, task: (ctx) => exec(task, onError, ctx), skip };

		// assume the task is a function
		// if it's not, listr will blow up anyway, which is fine
		return {
			title,
			task: (ctx) =>
				new Promise((resolve, reject) => {
					try {
						resolve(task(ctx));
					} catch (e) {
						if (typeof onError === 'function') onError(ctx);
						if (VERBOSE) console.log(e);
						reject(e);
					}
				}),
			skip,
		};
	});

	let renderer = 'default';
	if (IS_VERBOSE) renderer = import('./run-task-verbose-formater.mjs');

	return new Listr(listrTasks, {
		concurrent: concurrent ? getCpuCount() : false,
		collapse: true,
		renderer,
	});
}

// resolve the tasks from yargs to actual files
const getTasksFromModule = async (taskName) => {
	try {
		const modulePath = path.resolve(taskSrc, taskName);
		if (IS_DEV) {
			try {
				return import(`${modulePath}.dev`);
			} catch (e) {
				/* do nothing */
			}
			try {
				return import(`${modulePath}/index.dev`);
			} catch (e) {
				/* do nothing */
			}
		}

		const { description, task: imports } = await import(modulePath).then(
			(module) => module.default,
		);

		const task = await Promise.all(imports).then((tasks) =>
			tasks.map((module) => module.default),
		);

		return {
			description,
			task,
		};
	} catch (e) {
		// we can't find any modules, or something else has gone wrong in resolving it
		// so output an erroring task
		console.error(e);
		return {
			description: `${chalk.red(taskName)} failed:`,
			task: () => Promise.reject(e),
		};
	}
};

// get a list of the tasks we're going to run
const taskModules = await Promise.all(TASKS.map(getTasksFromModule));

// run them!
listrify(taskModules)
	.run({
		// we're adding these to the [listr context](https://github.com/SamVerschueren/listr#context)
		messages: [],
		stdouts: [],
	})
	.catch((e) => {
		// something went wrong, so log whatever we have
		if (!e.stderr && !e.stdout) console.log(e);
		if (e.stderr) console.error(`\n${e.stderr.trim()}`);
		if (e.stdout) console.log(`\n${e.stdout.trim()}`);
		return Object.assign(e.context ?? {}, { error: true });
	})
	.then((ctx) => {
		if (IS_STDOUT)
			ctx.stdouts.forEach((stdout) =>
				console.log(stdout.toString().trim()),
			);

		if (ctx.messages?.length) {
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
