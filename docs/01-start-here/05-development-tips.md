# Development tips

## Client-side development

### watch/reload
There is a `make watch` task available to build and watch for development
changes.

```bash
make watch
```

### Testing your JavaScript
You can run the Jasmine unit test suite with

```
make test
```

If you need to debug the tests in a browser, run the command

```
grunt test --no-single-run
```

and point your browser at [http://localhost:9876](http://localhost:9876).

## Server-side development

### Debugging Play application
You can debug your local Frontend application, by attaching a debugger.

* Start Simple Build Tool in debug mode by typing `./sbt --debug`.
* Build and run your application. See "Running" for steps.
* Use a debugger to attach to the remote Java process, on localhost:1044.

Any IDE debugger should be compatible. In IntelliJ, add a new Debug Configuration,
based on the Remote default.
Ensure the Transport is Socket, the Debugger mode is Attach, and the port is set to 1044.
Start a new Debug session, and your breakpoints should be active.

