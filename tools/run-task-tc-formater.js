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
                }
                if (task.hasFailed()) {
                    console.log(`##teamcity[buildProblem description='${task.title} failed']`);
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

		// task.subscribe(
		// 	event => {
		// 		if (event.type === 'SUBTASKS') {
		// 			render(task.subtasks);
		// 			return;
		// 		}
        //         console.log(task);
        //         if (event.type === 'STATE') {
        //             switch (task.state) {
        //                 case 'pending':
        //                     console.log(`##teamcity[blockOpened name='${task.title}']`);
        //                     break;
        //                 case 'failed':
        //                     console.log(`##teamcity[blockClosed name='${task.title}']`);
        //                     console.log(`##teamcity[buildProblem description='${task.title} failed']`);
        //                     if (task.output) console.log(task.output);
        //                     break;
        //                 case 'skipped':
        //                     console.log(`skipping ${task.title}`);
        //                     if (task.output) console.log(task.output);
        //                     console.log(`##teamcity[blockClosed name='${task.title}']`);
        //                     break;
        //                 case 'completed':
        //                     console.log(`##teamcity[blockClosed name='${task.title}']`);
        //                     break;
        //                 default:
        //             }
        //         } else if (event.type === 'DATA') {
        //             console.log(event.data);
        //         }
		// 	},
		// 	err => {
        //         console.log(`##teamcity[buildProblem description='${err}']`);
		// 	}
		// );
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
