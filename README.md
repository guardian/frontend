# Frontend

The backend of the Guardian website frontend.

**For everybody who engages with our journalism, [theguardian.com](https://www.theguardian.com) is an industry-best news website that is fast, accessible and easy to use. Unlike other ways of developing products, ours puts the audience first.**

Frontend is [a set of Play Framework 2 Scala applications](docs/02-architecture/01-applications-architecture.md). It is built in two parts, using `make` for the client side asset build and SBT for the Play Framework backend.

Frontend's responsiblity is to build JSON to pass to the modern rendering service, [Dotcom Rendering](https://github.com/guardian/dotcom-rendering).

# Core Development Principles (lines in the sand)

These principles apply to all requests on `www.theguardian.com` and `api.nextgen.guardianapps.co.uk` (our Ajax URL)

-   Every request can be cached and has an appropriate Cache-Control header set.
-   Each request may only perform one I/O operation on the backend. (you cannot make two calls to the content API or any other 3rd party)
-   The average response time of any endpoint is less than 500ms.
-   Requests that take longer than two seconds will be terminated.

# Documentation

**[All documentation notes and useful items can be found in the `docs` folder](docs).**

# New developers

Welcome! **[How to set up and run frontend](docs/01-start-here).**

To get set up, please follow [the installation guide](docs/01-start-here/01-installation-steps.md).

Fixes for common problems can be found [here](docs/01-start-here/04-troubleshooting.md).

Please read the [development tips](docs/01-start-here/05-development-tips.md) document to learn about more about development process.

For our deployment process, see [how to deploy](docs/01-start-here/03-how-to-deploy.md).
