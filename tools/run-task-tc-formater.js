/* eslint-disable no-console */
const figures = require('figures');
const chalk = require('chalk');

const render = tasks => {
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
                if (task.isCompleted() && !task.hasFailed() && !task.isSkipped()) {
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

module.exports = TeamCityRenderer;
