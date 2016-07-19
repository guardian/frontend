[![Gitter](https://badges.gitter.im/guardian/frontend.svg)](https://gitter.im/guardian/frontend?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## We're hiring!
Ever thought about joining us?<br/>
http://developers.theguardian.com/join-the-team.html

# Frontend
[The Guardian](http://www.theguardian.com) website frontend.

Frontend is [a set of Play Framework 2 Scala applications](https://github.com/guardian/frontend/wiki/Applications-architecture).

Frontend is built in two parts, using Grunt for the client side asset build and
SBT for the Play Framework backend.

# Core Development Principles (lines in the sand)
These principles apply to all requests on `www.theguardian.com` and `api.nextgen.guardianapps.co.uk` (our Ajax URL)

## On the server
* Every request can be cached and has an appropriate Cache-Control header set.
* Each request may only perform one I/O operation on the backend. (you cannot make two calls to the content API or any other 3rd party)
* The average response time of any endpoint is less than 500ms.
* Requests that take longer than two seconds will be terminated.

# New developers
Welcome! To get set up, please follow [the installation guide](https://github.com/guardian/frontend/wiki/Installation-steps).

Fixes for common problems can be found [here](https://github.com/guardian/frontend/wiki/Troubleshooting).

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

## Deploying
Deployment uses the [Riff Raff](https://github.com/guardian/riff-raff) application.

## Debugging Play application
You can debug your local Frontend application, by attaching a debugger.

* Start Simple Build Tool in debug mode by typing `./sbt --debug`.
* Build and run your application. See "Running" for steps.
* Use a debugger to attach to the remote Java process, on localhost:1044.

Any IDE debugger should be compatible. In IntelliJ, add a new Debug Configuration,
based on the Remote default.
Ensure the Transport is Socket, the Debugger mode is Attach, and the port is set to 1044.
Start a new Debug session, and your breakpoints should be active.

Additional Documentation
------------------------
If you're new, you'll want to see what [libraries we use](docs/libraries.md) in frontend.

Further documentation notes and useful items can be found in [docs](docs).

- [Integration testing documentation](integrated-tests/README.md)
- [sbt](http://www.scala-sbt.org)
- [play2-console](https://github.com/playframework/Play20/wiki/PlayConsole)
- [play2-wiki](https://github.com/playframework/Play20/wiki)
- [sbteclipse](https://github.com/typesafehub/sbteclipse)
- [sbt-idea](https://github.com/mpeltonen/sbt-idea)
- [magenta](https://github.com/guardian/deploy)
- [Jasmine testing framework](http://jasmine.github.io/)
