# Quick start guide

- [Security checks](#security)
- [Obtain AWS credentials](#obtain-aws-credentials)
- [Local dev server setup](#local-dev-server-setup)
- [Running the app](#running-the-app)
- [IDE Setup](#ide-setup)
- [Optional steps](#optional-steps)

## Security checks

All development laptops must be encrypted. If you are not 100% sure, please ask for help.

### Check your Mac

- Choose Apple menu > System Preferences
- Security & Privacy.
- Click the FileVault tab.
- ensure that FileVault is enabled for your disk

### Checking Linux (including desktop machines)

Follow [this link](https://www.google.co.uk) and enter the relevant search string for your system.

## Basic Tools

You need to have a few command line tools installed on your computer (some are used to install other tools). You should already have them if your laptop has been properly set up as part of your onboarding, otherwise here are what you need:

- [Homebrew](http://brew.sh/) (this is needed on Mac only)

	```bash
	$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	```

## Obtain AWS credentials

1. Fork [Janus](https://github.com/guardian/janus) and follow the readme (**Note:** you will need permission to access the Janus repo to do this, and 2FA set up on your Google account).
1. Make your change and push to a new branch (you can review the closed PRs for help).
1. Submit a PR.
1. To install local Janus credentials make sure you have `awscli` installed. For this run `brew install awscli` at your terminal.

## Local development server setup

Before checking out the repository you may need to add your guardian email address to your github account and [add an
SSH key to your GitHub account](https://help.github.com/articles/generating-ssh-keys/). Before pushing changes you may
need to [create an access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/).
Make sure your dev manager has added you to the necessary teams, in case you have need write access.

You need a Mac or Linux PC (Ubuntu).

We present you with two setup types: _automatic_ and _manual_. They are equivalent, the manual set up can be used if for some reasons you still have a problem after doing the automatic set up.

### Automatic Setup

1. Make sure you have `git` installed. Run `brew install git` if required.

1. Check out the repository:

    ```bash
    $ git clone git@github.com:guardian/frontend.git
    $ cd frontend
    ```

1. Get AWS Credentials using [Janus](https://janus.gutools.co.uk/) for *Frontend*, *CMS fronts* and *Content API* (You will need access to Janus).

1. Make sure you have the [latest version of Java](#jdk).

1. Run ```./setup.sh``` to install dependencies and compile assets. (If you get a _EACCES error_ see [here](04-troubleshooting.md#npm-eacces)).

1. All being well, you should be able to [run the app](#running-frontend)

### Manual Setup

### Configuration

You need one file on your machine:

 `~/.aws/config`

```
[profile frontend]
region = eu-west-1
```

### JDK

Java 11 is required - on Mac OS this can be installed using [sdkman](https://sdkman.io/):

```bash
$ sdk list java | grep -m 1 "11.*.1-amzn"
$ sdk install java 11.0.15.9.1-amzn # Choose latest of 11.*.1-amzn
$ sdk current java
Using java version 11.0.15.9.1-amzn
$ java -version
openjdk version "11.0.15" 2022-04-19 LTS
$ sdk use java 11.0.15.9.1-amzn
Using java version 11.0.15.9.1-amzn in this shell.
```

### Node.js

Node.js can be found [here](https://github.com/nodejs/node).

We recommend that you use the Node Version Manager to be able to switch easily between versions of nodes.

To install nvm:

```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```

You may find it useful to add [this script](https://gist.github.com/sndrs/5940e9e8a3f506b287233ed65365befb) to your
`.bash_profile` – or wherever else is appropriate for your setup – to automatically switch Node versions if an `.nvmrc`
is present.

Frontend uses a `.nvmrc` file which specifies a given version of node as a requirement. If you use
[nvm](https://github.com/creationix/nvm#install-script) to manage multiple versions of Node on your machine, you can run `nvm use` to swich to the version specified by `.nvmrc`. If that version number is not available locally, you might have to install the missing version with `nvm install <version number>`. You may also be using `asdf` or `fnm`.

Alternatively you could directly install Node on your system.
See [.nvmrc](https://github.com/guardian/frontend/blob/main/.nvmrc) for the current version and install that version using your preferred package manager.
For example:

Ubuntu:

```bash
$ curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
$ sudo apt-get install -y nodejs
```

Mac:

```bash
$ brew install node@[current-version]
```

eg:

```bash
$ brew install node@18.16.0
```

### Client side code

Install additional dependencies:

```bash
$ make install compile
```

The frontend application should now be ready to run.

## Running frontend

Note: The present text will show you how to run frontend, and how to run [dotcom-rendering](https://github.com/guardian/dotcom-rendering) along side it, and how to query the frontend server to render an article. This will be useful to you at least to build a mental model of the relationship (and dependency) between the two systems. That having been said, if you aim to work on content generated by dotcom-rendering, such as, at the time these lines are written, article content, then you might as well work directly with(in) dotcom-rendering. See the dotcom-rendering repository, README and code for details.

Compile the client side assets:

```bash
$ make watch
```

As a convenience, this command will also watch for changes to client side code and
automatically inject changes into the browser without requiring a browser refresh.

In another console, run `sbt`

```bash
$ sbt
```

Wait for sbt to be up and running (this may take few minutes if it's the first time). Then clean and compile at the sbt prompt

```
[root] $ clean
```

Then, when it's finished

```
[root] $ compile
```

We are first going to run the [article] app which serves most of news articles.

Switch to the [article] project by typing

```
[root] $ project article
```

At this point you cannot actually query an article because frontend now relies on dotcom-rendering to generate HTML documents. Assuming you already have installed [DCR (dotcom-rendering)](https://github.com/guardian/dotcom-rendering) you simply need to run

```
make dev
```

**at the DCR repository**. This will be starting your DCR local server.

With the DCR server running, frontend should now be able to server articles. To do so, you just need to run the [article] app, therefore at the sbt prompt do run

```
[article] $ run
```

And then put

[http://localhost:9000/uk-news/2020/feb/14/77-survivor-thelma-stober-to-lead-grenfell-memorial-commission](http://localhost:9000/uk-news/2020/feb/14/77-survivor-thelma-stober-to-lead-grenfell-memorial-commission)

in your web browser. If everything went fine, frontend running received the request, queried CAPI to retrieve article data, and then queried DCR to get the HTML document.

If you press [enter] in the terminal window where you are running the [article] app you should be back to the sbt prompt.

There is another app you can run called "dev-build". It is a more complete version of frontend trying to emulate the entire website.

If you switch to dev-build and then run it

```
project dev-build
[dev-build] $ run
```

You should be able to access more contents of the site, including the fronts. Note that depending on the state of the "DCR migration", some content may still be served by frontend itself and the others with the help of DCR.


Please note, `make watch` proxies port 3000 with the ability to live reload assets, so if you have `make watch` runing, you can access all frontend local links using port 3000.

If you have [setup local Nginx](https://github.com/guardian/frontend/blob/main/nginx/README.md) then try hitting
[https://m.thegulocal.com](https://m.thegulocal.com)

## IDE setup

### EditorConfig plugin

Install to your IDE from http://editorconfig.org/#download

### Scala Editor setup

Any Scala editor can be used for the project, but we recommend either Intellij or VS Code.

For Intellij:

* install the Scala plugin
* import the project.  Default settings are fine, except you need to make sure you choose JDK 1.8 (under JVM - Custom)
  otherwise it won't import correctly - You can find the location by pasting `/usr/libexec/java_home` into your
  terminal.

For VS Code:

* add the [Metals](https://scalameta.org/metals/docs/editors/vscode.html) extension. Then simply open the project and
  follow the instructions in your editor.

Code formatting is provided by scalafmt. See their [installation](https://scalameta.org/scalafmt/docs/installation.html)
docs for integration with your preferred editor. *You should configure this to format on save as unformatted code will
fail a build in our CI.*

Congratulations, you are now set up to edit frontend code!  See the [Optional steps](#optional-steps) below for other things to do.

### Client-side development with VSCode

While IntelliJ is great for Scala, you may want another option if you are writing a lot of JS and CSS, so quite a few people choose to use VSCode.

You can download VSCode from [https://code.visualstudio.com/](https://code.visualstudio.com/)

The built-in linting of VSCode may start finding TypeScript errors in JavaScript files...  To resolve this open your user settings and add the following lines:

``` json
    "javascript.validate.enable": false,
    "typescript.validate.enable": false,
```

You can use the Command Palette (shift + cmd + P) to open user or workspace settings, just type in `Preferences: Open User Settings`

Recommended VSCode extensions are listed in `.vscode/extensions.json` and VSCode should prompt you to install these when you open the project. You can also find and install these by searching for `@recommended` in the extensions pane.

### Nginx

If you are working on Identity or Discussion, Nginx must be installed and
configured to correctly serve the application, please refer to
[`/nginx/README.md`](https://github.com/guardian/frontend/blob/main/nginx/README.md) in this project.
This will allow you to access frontend via `https://m.thegulocal.com` and test signed in behaviour.

### Optional steps

**Before you go:** We would greatly appreciate it if you could complete our [Frontend Setup
Questionnaire](https://docs.google.com/forms/d/e/1FAIpQLSc6CVY0z-cGm2_Jm7gKkWbZ3yIlK0FaKPJZO3jAjxsZNSc5oQ/viewform?c=0&w=1).
It should only take 3 minutes and will help us improve this documentation and the setup process in the future. Thank you! 🙏
