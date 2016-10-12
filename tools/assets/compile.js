#!/usr/bin/env node
/* eslint-disable no-console */

// default tasks
module.exports = [{
    title: 'Compile assets for production',
    task: [
        require('./css/compile'),
        require('./javascript/compile'),
        require('./fonts/compile'),
        // require('./deploys-radiator'),
        require('./hash'),
        // require('./conf')
    ]
}];

const megalog = require('megalog');
const capitalize = require('lodash.capitalize');
const runner = require('./runner');

const {dev: isDev, _: target} = require('yargs').argv;
const taskModule = isDev ? `./${target}/compile.dev` : `./${target}/compile`;

function getTasks() {
    try {
        return require(taskModule);
    } catch (e) {
        megalog.error(`Cannot find a compilation task for \`${target}\`.`);
    }
    return null;
}

const tasks = getTasks();

if (tasks) {
    const taskName = capitalize(target.length ? target.toString() : 'asset');
    runner(tasks).run().then(() => {
        megalog.info(`${taskName} compilation is complete.`, {
            heading: 'Done'
        });
    }).catch(e => {
        megalog.error(`${taskName} compilation failed:\n\n${e}`);
    });
}

