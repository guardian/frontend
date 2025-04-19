## We're hiring!
![WE'RE_HIRING (1)](https://github.com/user-attachments/assets/5d4c9a30-1d80-4d25-a42e-4e56b3259f7a)

Ever thought about joining us?
[https://workforus.theguardian.com/careers/product-engineering/](https://workforus.theguardian.com/careers/product-engineering/)


# Frontend

<img src="http://www.j9ccc.com/wp-content/uploads/2019/12/The_Guardian-1.jpg" alt="The Guardian" width=200 height=140>
The Guardian website frontend.

**For everyone who engages with our journalism, [theguardian.com](https://www.theguardian.com) is an industry-best news website that is fast, accessible and easy to use. Unlike other ways of developing products, ours puts the audience first.**

Frontend is [a set of Play Framework 2 Scala applications](docs/02-architecture/01-applications-architecture.md). It is built in two parts, using `make` for the client-side asset build and SBT for the Play Framework backend.

For Articles, Frontend's responsibility is to build JSON to pass to the modern rendering service, [Dotcom Rendering](https://github.com/guardian/dotcom-rendering).

# Core Development Principles (lines in the sand)
These principles apply to all requests on `www.theguardian.com` and `api.nextgen.guardianapps.co.uk` (our Ajax URL)

* Every request can be cached and has an appropriate Cache-Control header set.
* Each request may  perform only  one I/O operation on the backend. (you cannot make two calls to the Content API or any other 3rd party)
* The average response time of any endpoint is less than 500ms.
* Requests that take longer than two seconds will be terminated.

# Documentation

**[All documentation notes and useful items can be found in the `docs` folder](docs).**

# New developers
Welcome! **[How to set up and run frontend](docs/01-start-here).**

To get started, please follow [the installation guide](docs/01-start-here/01-installation-steps.md).

Fixes for common problems can be found [here](docs/01-start-here/04-troubleshooting.md).

Please read the [development tips](docs/01-start-here/05-development-tips.md) document to learn more about development process.

For our deployment process, see [How to Deploy](docs/01-start-here/03-how-to-deploy.md).
