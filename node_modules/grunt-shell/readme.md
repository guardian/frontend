# grunt-shell

*Requires grunt 0.4. Use version 0.1.4 for grunt 0.3 compatibility*

[Grunt][grunt] task to run shell commands.

A good way to interact with other CLI tools. E.g. compiling Compass `compass compile` or get the current git branch `git branch`.


## Getting Started

If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a [gruntfile][Getting Started] as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

```shell
npm install grunt-shell --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-shell');
```

[grunt]: http://gruntjs.com
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started


## Documentation


### Example usage


#### Run command

Create a folder named `test`.

```javascript
shell: {
	makeDir: {
		command: 'mkdir test'
	}
}
```

The `command` property supports templates :

```javascript
testDir: 'test',
shell: {
	makeDir: {
		command: 'mkdir <%= testDir %>'
	}
}
```



#### Run command and display the output

Output a directory listing in your Terminal.

```javascript
shell: {
	dirListing: {
		command: 'ls',
		options: {
			stdout: true
		}
	}
}
```


#### Custom callback

Do whatever you want with the output.

```javascript
function log(err, stdout, stderr, cb) {
	console.log(stdout);
	cb();
}

...

shell: {
	dirListing: {
		command: 'ls',
		options: {
			callback: log
		}
	}
}
```

#### Option passed to the .exec() method

Run a command in another directory. In this example we run it in a subfolder using the `cwd` (current working directory) option.

```javascript
shell: {
	subfolderLs: {
		command: 'ls',
		options: {
			stdout: true,
			execOptions: {
				cwd: 'tasks'
			}
		}
	}
}
```


### Config


#### command

**Required**  
Type: `String`

The command you want to run. Supports templates.


### Options


#### stdout

Default: `false`  
Type: `Boolean`

Show stdout in the Terminal.


#### stderr

Default: `false`  
Type: `Boolean`

Show stderr in the Terminal.


#### failOnError

Default: `false`  
Type: `Boolean`

Fail task if it encounters an error. Does not apply if you specify a `callback`.


#### callback(err, stdout, stderr, cb)

Default: `function () {}`  
Type: `Function`

Lets you override the default callback with your own.

**Make sure to call the `cb` method when you're done.**


#### execOptions

Default: `undefined`  
Accepts: Object

Specify some options to be passed to the [.exec()](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) method:

- `cwd` String *Current working directory of the child process*
- `env` Object *Environment key-value pairs*
- `setsid` Boolean
- `encoding` String *(Default: 'utf8')*
- `timeout` Number *(Default: 0)*
- `maxBuffer` Number *(Default: 200\*1024)*
- `killSignal` String *(Default: 'SIGTERM')*


## Upgrade from 0.1.4 to 0.2.0

Because of the transition to grunt 0.4 there are some changes. To conform to new grunt standards, all options are now to be specified in an `options` object. I also took the opportunity to improve the task. The `stdout` and `stderr` options now only supports a boolean. If you want to do something with the result use the `callback` option. The `callback` option also changed.


## Tests

Grunt currently doesn't have a way to test tasks directly. You can test this task by running `grunt` and manually verify that it works.


## Contribute

In lieu of a formal styleguide, take care to maintain the existing coding style.


## License

MIT License
(c) [Sindre Sorhus](http://sindresorhus.com)
