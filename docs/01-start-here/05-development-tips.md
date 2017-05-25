# Development tips

## Client-side development

### watch/reload
There is a `make watch` task available to build and watch for development
changes. View it on port `3000` - it uses [Browsersync](https://www.browsersync.io/) under the hood.

If you use `m.thegulocal.com` it will try port `3000` and fall back to `9000` if unavailable.

```bash
make watch
```

### Testing your JavaScript
You can run the Jasmine unit test suite with

```
make test
```

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

### Viewing AMP Pages

When running frontend locally, the AMP version of pages can be viewed by adding the `?amp` querystring to the end of the URL. For example:

```
http://localhost:9000/world/2015/oct/15/obama-delay-withdrawal-us-troops-afghanistan?amp
```
