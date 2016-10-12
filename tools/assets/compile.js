#!/usr/bin/env node
/* eslint-disable no-console */

// default tasks
module.exports = [{
    title: 'Compile assets for production',
    task: [
        require('./css/compile'),
        require('./javascript/compile'),
        require('./fonts/compile'),
        require('./deploys-radiator/compile'),
        require('./hash'),
        require('./conf/compile')
    ]
}];

const megalog = require('megalog');
const capitalize = require('lodash.capitalize');
const stripAnsi = require('strip-ansi');
const runner = require('./runner');

const {dev: isDev, _: target, verbose: verbose} = require('yargs').argv;
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
    runner(tasks, {verbose: verbose}).run().then(() => {
        const message = `${taskName} compilation is complete.`;
        verbose ? console.log(message) : megalog.info(message, {heading: 'Done'});
    }).catch(e => {
        const message = `${taskName} compilation failed...`;
        verbose ? console.log(message) : megalog.error(message);
        console.error(verbose ? stripAnsi(e.stdout || e) : (e.stdout || e));
    });
}

