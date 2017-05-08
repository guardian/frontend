const figures = require('figures');
const chalk = require('chalk');

const log = (title, parents, message = '') => {
    console.log(`${chalk.dim(`${parents.concat([
        '',
    ]).join(` ${figures.arrowRight} `)}${title}`)} ${message}`);
};

const render = (tasks, parents = []) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const task of tasks) {
        task.subscribe(event => {
            if (event.type === 'SUBTASKS') {
                render(task.subtasks, parents.concat([task.title]));
                return;
            }
            if (event.type === 'STATE') {
                if (task.isPending()) {
                    log(task.title, parents, chalk.dim('...'));
                }
                if (task.hasFailed()) {
                    log(task.title, parents, chalk.red(figures.cross));
                }
                if (task.isSkipped()) {
                    log(
                        task.title,
                        parents,
                        `${chalk.dim(figures.arrowDown)} (${task.output})`
                    );
                }
                if (
                    task.isCompleted() &&
                    !task.hasFailed() &&
                    !task.isSkipped()
                ) {
                    log(task.title, parents, chalk.dim.green(figures.tick));
                }
            }
            if (event.type === 'DATA') {
                console.log(event.data);
            }
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

module.exports = VerboseRenderer;
