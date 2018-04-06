# **Quick start guide**

- [Security checks](#security)
- [Obtain AWS credentials](#obtain-aws-credentials)
- [Local dev server setup](#local-dev-server-setup)
- [Running the app](#running-the-app)
- [IDE Setup](#ide-setup)
- [Optional steps](#optional-steps)

# Security checks

All development laptops must be encrypted. If you are not 100% sure, please ask for help.

## Check your Mac

- Choose Apple menu > System Preferences
- Security & Privacy.
- Click the FileVault tab.
- ensure that FileVault is enabled for your disk

## Checking Linux (including desktop machines)

Follow [this link](https://www.google.co.uk) and enter the relevant search string for your system.

# Obtain AWS credentials

1. Fork [Janus](https://github.com/guardian/janus) and follow the readme (**Note:** you will need permission to access the Janus repo to do this, and 2FA set up on your Google account)
2. Make your change and push to a new branch (you can review the closed PRs for help)
3. Submit a PR
4. You may need to `pip install awscli` and add `/Library/Frameworks/Python.framework/Versions/Current/bin` to your `$PATH` to run the commands Janus gives you.

**Note:** To install `awscli` on MacOS El Capitan and later, you will need to run `pip install awscli --upgrade --ignore-installed six`
due to the [System Integrity Protocol](https://github.com/pypa/pip/issues/3165)

# Local dev server setup

**Hello there!** 👋 After completing this setup guide, we would greatly appreciate it if you could complete our [Frontend Setup 
Questionnaire](https://docs.google.com/forms/d/e/1FAIpQLSc6CVY0z-cGm2_Jm7gKkWbZ3yIlK0FaKPJZO3jAjxsZNSc5oQ/viewform?c=0&w=1).
It should only take 3 minutes and will help us improve this documentation and the setup process in the future. Thank you! 🙏

Before checking out the repository you may need to add your guardian email address to your github account and [add an
SSH key to your GitHub account](https://help.github.com/articles/generating-ssh-keys/). Before pushing changes you may
need to [create an access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/).
Make sure your dev manager has added you to the necessary teams, in case you have need write access.

You need a Mac or Linux PC (Ubuntu).

## Automatic

1. Check out the repository:

    ```bash
    $ git clone git@github.com:guardian/frontend.git
    $ cd frontend
    ```

2. Get AWS Credentials using [Janus](https://janus.gutools.co.uk/) for *Frontend* and *CMS fronts* (you will need access to Janus)

3. Make sure you have the [latest version of Java](#jdk)

4. Run ```./setup.sh``` to install dependencies and compile assets. *[EACCES error?](04-troubleshooting.md#npm-eacces)*

5. All being well, you should be able to [run the app](#running-the-app)

Manual
------

### Configuration

You need one file on your machine:

 `~/.aws/config`

```
[profile frontend]
region = eu-west-1
```

### [Homebrew](http://brew.sh/)

This is needed on Mac only:

```bash
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

### JDK

Ubuntu: Java 8 is required, but only OpenJDK 7 is available in the official Ubuntu repo. Install Java 8 as below.

```bash
$ sudo apt-get purge openjdk*
$ sudo add-apt-repository -y ppa:webupd8team/java
$ sudo apt-get update
$ echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
$ sudo apt-get -y install oracle-java8-installer
```

Mac: Install from [Oracle web site](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

### [Node.js](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

The frontend uses an `.nvmrc` which specifies Node 8.x as a requirement. If you use 
[NVM](https://github.com/creationix/nvm#install-script) to manage multiple versions of Node on your machine, you can 
just `nvm use` (or `nvm install` if you don't have 8 installed yet).

To install nvm:

```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
```

You may find it useful to add [this script](https://gist.github.com/sndrs/5940e9e8a3f506b287233ed65365befb) to your 
`.bash_profile` – or wherever else is appropriate for your setup – to automatically switch Node versions if an `.nvmrc` 
is present.

If you just want to use your system Node, you'll need to install v8:

Ubuntu:

```bash
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -
$ sudo apt-get install -y nodejs
```

Mac:

```bash
$ brew install node@8
```

### Xcode (if on a Mac, one of the Node modules requires it)

This is needed on Mac only:
https://itunes.apple.com/gb/app/xcode/id497799835

Xcode installs an old version of git `1.9.3`. If you need a newer version, you can run

```bash
$ brew install git
$ echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
```

Quit Terminal, relaunch it and check that `git --version` outputs `2.1.3` or newer.


### Client side code

Install additional dependencies:

```bash
$ make install
```

The frontend application should now be ready to run.

Running the app
===============
Compile the client side assets: 

```bash
$ make watch
```

As a convenience, this command will also watch for changes to client side code and 
automatically inject changes into the browser without requiring a browser refresh.

In another console, run the supplied bash script [sbt]. The dot and slash are important in this command.

```bash
$ ./sbt
```

Wait for SBT to be up and running. This may take 15 mins or so to start the first time - you'll know
it's done when you get a prompt. If it is your first time, compile the project.

```
compile
```

Switch project by typing

```
project dev-build
```

Then run the project locally by typing

```
run
```

This also can take a while the first time.

Now check that you are up and running by hitting the following URLs:

* [http://localhost:3000/media](http://localhost:3000/media)
* [http://localhost:3000/media/2012/dec/05/newspaper-editors-sign-up-leveson](http://localhost:3000/media/2012/dec/05/newspaper-editors-sign-up-leveson)
* [http://localhost:3000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery](http://localhost:3000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery)

Please note, `make watch` proxies port 3000 with the ability to live reload assets, you could access all links using port 9000 as well. 

If you have [setup local Nginx](https://github.com/guardian/frontend/blob/master/nginx/README.md) then try hitting 
[https://m.thegulocal.com](https://m.thegulocal.com)

Congratulations, you have a local instance running!  Now continue on to set up your IDE.

# IDE setup

## EditorConfig plugin

Install to your IDE from http://editorconfig.org/#download

## IntelliJ metadata
To create project files for use in IntelliJ, you need to make sure you install the Scala plugin from Preferences->Plugins. It supports SBT and Play.
Then load IntelliJ, then click Import project and import the directory as an SBT project. Default settings are fine, except you need to make sure you choose JDK 1.8 (under JVM - Custom) otherwise it won't import correctly - You can find the location by pasting `/usr/libexec/java_home` into your terminal.

Congratulations, you are now set up to edit frontend code!  See the [Optional steps](#optional-steps) below for other things to do.


# Optional steps

**Before you go:** We would greatly appreciate it if you could complete our [Frontend Setup 
Questionnaire](https://docs.google.com/forms/d/e/1FAIpQLSc6CVY0z-cGm2_Jm7gKkWbZ3yIlK0FaKPJZO3jAjxsZNSc5oQ/viewform?c=0&w=1).
It should only take 3 minutes and will help us improve this documentation and the setup process in the future. Thank you! 🙏

## Nginx

If you are working on Identity or Discussion, Nginx must be installed and
configured to correctly serve the application, please refer to
[`/nginx/README.md`](https://github.com/guardian/frontend/blob/master/nginx/README.md) in this project.
This will allow you to access frontend via `https://m.thegulocal.com`
