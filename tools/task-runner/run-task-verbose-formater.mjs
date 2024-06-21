import figures from 'figures';
import chalk from 'chalk';

const { dim, red } = chalk;

const { arrowRight, cross, arrowDown, tick } = figures;

const log = (title, parents, message = '') => {
	console.log(
		`${dim(
			`${parents.concat(['']).join(` ${arrowRight} `)}${title}`,
		)} ${message}`,
	);
};

const render = (tasks, parents = []) => {
	// eslint-disable-next-line no-restricted-syntax
	for (const task of tasks) {
		task.on('SUBTASKS', (event) => {
			render(task.subtasks, parents.concat([task.title]));
		});
		task.on('STATE', (event) => {
			if (task.isPending()) {
				log(task.title, parents, dim('...'));
			}
			if (task.hasFailed()) {
				log(task.title, parents, red(cross));
			}
			if (task.isSkipped()) {
				log(task.title, parents, `${dim(arrowDown)} (${task.output})`);
			}
			if (task.isCompleted() && !task.hasFailed() && !task.isSkipped()) {
				log(task.title, parents, dim.green(tick));
			}
		});
		task.on('DATA', (event) => {
			console.log(event.data);
		});
	}
};

class VerboseRenderer {
	constructor(tasks) {
		// eslint-disable-next-line no-underscore-dangle
		this._tasks = tasks;
	}

	// eslint-disable-next-line class-methods-use-this
	get nonTTY() {
		return true;
	}

	render() {
		// eslint-disable-next-line no-underscore-dangle
		render(this._tasks);
	}

	// eslint-disable-next-line class-methods-use-this
	end() {
		// do nothing
	}
}

export default VerboseRenderer;
