/* eslint-disable no-console */

'use strict';
const figures = require('figures');
const cliCursor = require('cli-cursor');

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
                    console.log(`##teamcity[message text='Running |'${task.title}|'' status='ERROR']`);
                }
                if (task.hasFailed()) {
                    console.log(`##teamcity[message text='|'${task.title}|' failed' status='ERROR']`);
                    console.log(`##teamcity[buildProblem description='|'${task.title}|' failed']`);
                }
                if (task.isSkipped()) {
                    console.log(`skipping ${task.title}`);
                }
                if (task.isCompleted() && !task.hasFailed() && !task.isSkipped()) {
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
		this._tasks = tasks;
	}

	get nonTTY() {
		return true;
	}

	render() {
		cliCursor.hide();
		render(this._tasks);
	}

	end() {
		cliCursor.show();
	}
}

module.exports = TeamCityRenderer;
