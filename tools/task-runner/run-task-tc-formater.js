const figures = require('figures');
const chalk = require('chalk');

const render = tasks => {
    // eslint-disable-next-line no-restricted-syntax
    for (const task of tasks) {
        task.subscribe(event => {
            if (event.type === 'SUBTASKS') {
                render(task.subtasks);
                return;
            }
            if (event.type === 'STATE') {
                if (task.isPending()) {
                    console.log(`##teamcity[blockOpened name='${task.title}']`);
                }
                if (task.hasFailed()) {
                    console.log(`##teamcity[message text='|'${task.title}|' failed' status='ERROR']`);
                    console.log(`##teamcity[buildProblem description='|'${task.title}|' failed']`);
                }
                if (task.isSkipped()) {
                    console.log(task.output);
                }
                if (
                    task.isCompleted() &&
                    !task.hasFailed() &&
                    !task.isSkipped()
                ) {
                    console.log(`##teamcity[message text='${chalk.green(figures.tick)} ${task.title}']`);
                    console.log(`##teamcity[blockClosed name='${task.title}']`);
                }
            }
            if (event.type === 'DATA') {
                console.log(event.data);
            }
        });
    }
};

class TeamCityRenderer {
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
    end() {}
}

module.exports = TeamCityRenderer;
