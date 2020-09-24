## We're hiring!
Ever thought about joining us?
https://workforus.theguardian.com/careers/digital-development/

# Frontend
The Guardian website frontend.

**For everybody who engages with our journalism, [theguardian.com](https://www.theguardian.com) is an industry-best news website that is fast, accessible and easy to use. Unlike other ways of developing products, ours puts the audience first.**

Frontend is [a set of Play Framework 2 Scala applications](docs/02-architecture/01-applications-architecture.md). It is built in two parts, using `make` for the client side asset build and SBT for the Play Framework backend.

# Moving to main

The `master` branch in the frontend repository has now been renamed to `main`. If you work with this repository, there are two things you need to do!

First, you need to make some changes to your local repository. We recommend you run the following sequence of commands, which will rename your master branch to main and set main as your default branch.

```
git fetch --all
git remote set-head origin -a
git branch master --set-upstream-to origin/main
git branch -m master main
```


Second, you’ll need to rebase or merge from main on any branch you’ve started working on before the rename. This is because frontend has a pre-push git hook that is hardcoded to look for `origin/master`. This has been patched in main, so you’ll need to integrate that change into your branch to be able to push to github.

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

Please read the [development tips](docs/01-start-here/05-development-tips.md) document to learn about more about development process.

## Deploying
Follow the steps described in the [How to deploy document](docs/01-start-here/03-how-to-deploy.md).
