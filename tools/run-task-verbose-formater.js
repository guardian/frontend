/* eslint-disable no-console */
const figures = require('figures');
const chalk = require('chalk');

const log = (title, parents, message = '') => {
    console.log(chalk.dim(`${parents.concat(['']).join(` ${figures.arrowRight} `)}${title}`) + ` ${message}`);
};

const render = (tasks, parents = []) => {
	for (const task of tasks) {
        task.subscribe(event => {
            if (event.type === 'SUBTASKS') {
                render(task.subtasks, parents.concat([task.title]));
                return;
            }
            if (event.type === 'STATE') {
                if (task.isPending()) {
                    log(task.title, parents);
                }
                if (task.hasFailed()) {
                    log(task.title, parents, chalk.red(figures.cross));
                }
                if (task.isSkipped()) {
                    log(task.title, parents, `${chalk.dim(figures.arrowDown)} (${task.output})`);
                }
            }
            if (event.type === 'DATA') {
               log(task.title, parents, event.data);
           }
        });
	}
};

class VerboseRenderer {
	constructor (tasks) {
		this._tasks = tasks;
	}

	get nonTTY () {
		return true;
	}

	render () {
		render(this._tasks);
	}

	end () {}
}

module.exports = VerboseRenderer;
