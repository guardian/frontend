# Task runner

This is lightweight task runner that effectively wraps [listr](https://github.com/SamVerschueren/listr) to provide a UI on tasks, which are defined in `tools/__tasks__/`.

It's intended to exist ‘behind the scenes’, and you should probably be running the tasks it runs from [`make`](https://github.com/guardian/frontend/blob/main/makefile) or something similar.

## Running tasks

It takes one or more tasks to run as arguments, which should be relative paths within the `__tasks__` directory, so that:

```
./tools/task-runner/runner fakemodule/fakemodule
```

will run the task defined in `tools/__tasks__/fakemodule/fakemodule.js`.

### Dev tasks

You can pass a `--dev` flag to prefer a dev version, if it exists (suffix the task's filename with `.dev`), so that:

```
./tools/task-runner/runner fakemodule/fakemodule --dev
```
- runs `tools/__tasks__/fakemodule/fakemodule.dev.js` if it exists
- reverts to `tools/__tasks__/fakemodule/fakemodule.js` if the above fails

### Modes

Tasks can be run with `--verbose` and `--teamcity` flags for fuller output, but this shouldn't usually be needed (hopefully).

### Options

For a full list, run `./tools/task-runner/runner -h`.

## Defining tasks

Task definitions are standard node modules that export a task object. As a minumum, they must export:

1. `description`
2. `task`


### `description#String`

Describes the task!

### `task#String`

Strings are treated as a standard terminal command:

```js
module.exports = {
    description: "Print 'hello'",
    task: "echo 'hello'"
}
```

They are run with [execa](https://github.com/sindresorhus/execa), which checks for locally installed binaries (`./node_modules`) before global ones, just as with npm scripts.

### `task#Function`



```js
module.exports = {
    description: "run a JS function",
    task: () => {...}
}
```
The ['Task' section of the listr docs](https://github.com/SamVerschueren/listr#task) covers this best (since they map directly onto them).

### `task#Array`

Tasks can also be an array of subtasks (which must also be valid tasks):

```js
module.exports = {
    description: "my task",
    task: [
        {
            description: 'a subtask',
            task: "command to run"
        },
        {
            description: 'another subtask',
            task: () => {
                // do something...
            }
        }
    ]
}
```

If the task is an array of other tasks, you can also specify that its tasks should run concurrently:

```js
module.exports = {
    description: "my concurrent task",
    task: [
    	// tasks...
    ],
    concurrent: true
}
```

### Requiring task modules

Since tasks are just JS objects, you can `require` them in the standard node way too:

```js
module.exports = {
    description: "run another task",
    task: require('./another-task')
}
```
