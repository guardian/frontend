// This is the asset tasks runner.
// It wraps the steps in listr for a nice UI
// https://github.com/SamVerschueren/listr

const Listr = require('listr');
const execa = require('execa');
const flatten = require('lodash.flatten');

// don't duplicate tasks
const cache = [];

function listrify(steps, {concurrent = false} = {}) {
    const listrTasks = steps
        .map(step => {
            const { title, task, concurrent } = step;

            // if another task has included this one, don't run it again
            const skip = cache.indexOf(step) !== -1 ? () => 'Skipping: already run by another task' : false;
            cache.push(step);

            // if the task is a set of subtasks, prepare them
            if (Array.isArray(task)) {
                return { title, task: () => listrify(flatten(task), {concurrent}), skip};
            }

            // treat tasks that are strings as terminal commands
            if (typeof task === 'string') {
                const [binary, ...options] = task.split(' ');
                return { title, task: () => execa(binary, options), skip};
            }

            return { title, task, skip };
        });
    return new Listr(listrTasks, {concurrent});
}

module.exports = listrify;
