[![Gitter](https://badges.gitter.im/guardian/frontend.svg)](https://gitter.im/guardian/frontend?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## We're hiring!
Ever thought about joining us? 
https://workforus.theguardian.com/careers/digital-development/

# Frontend
[The Guardian](https://www.theguardian.com) website frontend.

Frontend is [a set of Play Framework 2 Scala applications](https://github.com/guardian/frontend/wiki/Applications-architecture).

Frontend is built in two parts, using `make` for the client side asset build and SBT for the Play Framework backend.

# Documentation

**[All documentation notes and useful items can be found in the `docs` folder](docs).**

# Core Development Principles (lines in the sand)
These principles apply to all requests on `www.theguardian.com` and `api.nextgen.guardianapps.co.uk` (our Ajax URL)

## On the server
* Every request can be cached and has an appropriate Cache-Control header set.
* Each request may only perform one I/O operation on the backend. (you cannot make two calls to the content API or any other 3rd party)
* The average response time of any endpoint is less than 500ms.
* Requests that take longer than two seconds will be terminated.

# New developers
Welcome! **[The best place to start is here](docs/01-start-here)**

To get set up, please follow [the installation guide](docs/01-start-here/01-installation-steps.md).

Fixes for common problems can be found [here](docs/01-start-here/04-troubleshooting.md).

Please, read the [development tips](docs/01-start-here/05-development-tips.md) document to learn about more about development process.

## Deploying
Follow the steps described in the [How to deploy document](docs/01-start-here/03-how-to-deploy.md).
