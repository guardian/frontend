We're hiring!
--------
Ever thought about joining us and have the right to work in the UK?<br/>
http://developers.theguardian.com/join-the-team.html

Frontend
========
The Guardian website frontend.

Frontend is a set of Play Framework 2 Scala applications.

Frontend is built in two parts, using Grunt for the client side asset build and
SBT for the Play Framework backend.

Core Development Principles (lines in the sand)
===============================================

These principles apply to all requests on `www.theguardian.com` and `api.nextgen.guardianapps.co.uk` (our Ajax URL)

On the server
-------------

* Every request can be cached and has an appropriate Cache-Control header set.
* Each request may only perform one I/O operation on the backend. (you cannot
make two calls to the content API or any
  other 3rd party)
* The average response time of any endpoint is less than 500ms.
* Requests that take longer than two seconds will be terminated.

New developers quick-start
===========================

Contents:

1. [Local Test Server setup](#local-test-server-setup)
* [IDE Setup](#ide-setup)
* [Troubleshooting](#troubleshooting)
* [Optional steps](#optional-steps)
* [Useful information and hints](#useful-information-and-hints)
* [Additional Documentation](#additional-documentation)

## Local Test Server setup
You need A Mac or Linux PC (ubuntu).

Before checking out the repository you may need to [add an SSH key to your GitHub account](https://help.github.com/articles/generating-ssh-keys/).

### Automatic

1. Check out the repository:

    ```
    git clone git@github.com:guardian/frontend.git
    cd frontend
    ```

2. Run ```./setup.sh``` to install dependencies and compile assets
3. All being well, you should be able to [run the app](#run-the-app)

### Manual
Install each of the things listed:

#### Configuration files

You need 3 files on your machine.

1. `/etc/gu/install_vars`
```
STAGE=DEV
```

* `~/.gu/frontend.properties`

	[frontend.properties](https://drive.google.com/a/guardian.co.uk/#search/frontend.properties) contains the content.

    Ask your team mates to share it with you if you don't get any results.

* `~/.aws/credentials`

	Ask your team mate to create an account for you and securely send you the access key.  For security, you must enable MFA - ask if you're not sure what this means.
```
[nextgen]
aws_access_key_id=[YOUR_AWS_ACCESS_KEY]
aws_secret_access_key=[YOUR_AWS_SECRET_ACCESS_KEY]
region=eu-west-1
```

#### [Homebrew](http://brew.sh/)

This is needed on Mac only:
```bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
#### A JDK

Ubuntu: Java 8 is required, but only OpenJDK 7 is available in the official Ubuntu repo. Install Java 8 as below.

```bash
sudo apt-get purge openjdk*
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get update
echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
sudo apt-get -y install oracle-java8-installer
```

Mac: Install from [Oracle web site](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

#### [Node.js](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

Ubuntu:
```bash
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
```
Mac:
```bash
brew install node
```

#### Grunt (build tool)

Ubuntu/Mac:
```
sudo npm -g install grunt-cli
```

#### JSPM (package management)

Ubuntu/Mac:
```
sudo npm -g install jspm
jspm registry config github
```

It'll ask for a GitHub access token. Go to GitHub Settings -> Applications and [generate new token](https://github.com/settings/tokens/new). Ensure only the public_repo scope is checked.
Now create a registry instance.
```
npm -g install jspm-bower-endpoint # jspm >= 0.15.0
jspm registry create bower jspm-bower-endpoint
```

#### Ruby >= v1.9.x (use `ruby -v` to check if you have it installed)

Ubuntu:
```
sudo apt-get install ruby ruby-dev
```
#### [bundler](http://gembundler.com/)

Ubuntu/Mac:
```
sudo gem install bundler
```

#### Xcode (if on a Mac, one of the Node modules requires it)

This is needed on Mac only:
https://itunes.apple.com/gb/app/xcode/id497799835

Xcode installs an old version of git `1.9.3`. If you need a newer version, you can run
```
brew install git
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
```
Quit Terminal, relaunch it and check that `git --version` outputs `2.1.3` or newer.

#### [libpng](http://libpng.org/pub/png/libpng.html)

Ubuntu:
```
sudo apt-get install libpng-dev
```
Mac:
```
brew install libpng
```

#### The frontend code
Note: Remember to see [Troubleshooting](#troubleshooting) below if you have any issues.

```
git clone git@github.com:guardian/frontend.git

cd frontend
```

Install node dependencies:
```
npm install
```

Install additional dependencies:
```
bundle
grunt install
```

npm, bundle, and jspm are also run by `install-dependencies.sh`.

After this, you can compile the assets:
```
grunt compile
```

### Run the app
In another console, run the supplied bash script [sbt]. The dot and slash are important in this command.
```
./sbt
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

* [http://localhost:9000/film](http://localhost:9000/film)
* [http://localhost:9000/media/2012/dec/05/newspaper-editors-sign-up-leveson](http://localhost:9000/media/2012/dec/05/newspaper-editors-sign-up-leveson)
* [http://localhost:9000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery](http://localhost:9000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery)

Congratulations, you have a local instance running!  Now continue on to set up your IDE.

##IDE setup
You need a copy of the source code from above. If not, run this command:
```
git clone git@github.com:guardian/frontend.git
```

###EditorConfig plugin

Install to your IDE from http://editorconfig.org/#download

###intelliJ metadata
To create project files for use in IntelliJ, you need to make sure you install the Scala plugin from Preferences->Plugins.  It supports SBT and Play.
Then load IntelliJ, then click Import project and import the directory as an SBT project.  Default settings are fine, except you need to make sure you choose JDK 1.8 (under JVM - Custom) otherwise it won't import correctly - You can find the location by pasting `/usr/libexec/java_home` into your terminal.

Congratulations, you are now set up to edit frontend code!  See the [Optional steps](#optional-steps) below for other things to do.

## Troubleshooting

###NPM "EACCES"

If you get errors like this on `npm install`
```
npm WARN locking Error: EACCES, open '/Users/jduffell/.npm/_locks/karma-requirejs-4becac899d6c8f35.lock'
```

Sometimes when you install npm, it ends up owned by root (but in your home
directory).

Check that you own your own .npm directory `ls -ld ~/.npm`

If it is owned by root, then take ownership of it
`sudo chown -R username:username ~/.npm`

#### Global install permissions errors
The script installs global npm packages without sudo. If you get npm permission errors, follow the guide to using npm without sudo [here](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).

###phantomjs permissions errors (OSX)
If you get an error about not having permissions to execute phantomjs during `grunt compile`, your machine is probably set up as managed and you'll need to ask IT to make it unmanaged.

###File handles - "Too many files open"

You may run into a "too many files open" error during
compilation or reloading. You can find out how many file handles you are
allowed per process by running `ulimit -n`. This can be quite low, e.g. 1024 on linux or 256 on Mac

####Linux

To increase the limit do the following (instructions from Ubuntu 12.10)...

In the file `/etc/security/limits.conf` add the following two lines
```
*  soft  nofile 20000
*  hard  nofile 65000
```

And in the file `/etc/pam.d/common-session` add the following line.
```
session required pam_limits.so
```

Restart the machine.

For more info see http://www.cyberciti.biz/faq/linux-increase-the-maximum-number-of-open-files/

####Mac

* Edit your `~/.bash-profile` file
* add the following line: `ulimit -n 1024`
* save and close the file
* back at the command prompt enter: `source .bash_profile` and hit return.

Now you should be able to compile and run. Yay.

###"No route to host" or "Unsupported major.minor version 52.0"

If you get no route to host, it means you are not using the 1.8 jre.  Type `java -version` to check.  You may need
to close and reopen your terminal if you installed 1.8 recently.

You may also see `java.lang.UnsupportedClassVersionError: play/runsupport/classloader/ApplicationClassLoaderProvider : Unsupported major.minor version 52.0` which is described in the [Play 2.4 migration guide](https://www.playframework.com/documentation/2.4.x/Migration24#Java-8-support).

Follow the [JDK install guide above.](#a-jdk)

## Optional steps

###NVM
Some packages (imagemin) are not working with newest Node.js. So if you want to run multiple Node.js versions on your system you may want to use [nvm](https://github.com/creationix/nvm)

###Memcached

Memcached `sudo apt-get install memcached` -
(most of the time you do not want to use it as caching makes local development
harder)

###Nginx


If you are working on Identity or Discussion, Nginx must be installed and
configured to correctly serve the application, please refer to
[`/nginx/README.md`](./nginx/README.md) in this project.

###Vagrant

You can run the project with the supplied Vagrantfile - make sure you
understand what vagrant is http://www.vagrantup.com/

* Make sure you have [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
and [Vagrant](http://docs.vagrantup.com/v2/installation/index.html) installed
(on Ubuntu `sudo apt-get install virtualbox vagrant`)
* change directory into the folder where this README is located
* `vagrant up` - this will take a while, make some coffee
* You can now get onto the box by `vagrant ssh`
* the project is located in /vagrant so `cd /vagrant`
* `./sbt`


###Client-side development mode

There is a `grunt watch` task available to build and watch for development
changes, but `grunt-watch` is pretty inefficient to compile our Sass into CSS
so @mattosborn created a script called [grunt-csdevmode](https://github.com/mattosborn/grunt-csdevmode).

`grunt csdevmode` also pushes stylesheets to all connected browsers:
no need to reload a page to preview your changes, just like with Livereload.

```bash
grunt compile --dev
grunt csdevmode
```

## Useful information and hints

###Play console

Play Framework will recompile code changes on refresh.

Further information on using the Play console is available
[here](https://github.com/playframework/Play20/wiki/PlayConsole).

###Endpoints

The available endpoints are listed in `conf/routes` of each application and
typically include:

* `/management`: Operations support as per standard webapp guidelines. See
  guardian-management.
* `/<path>`: Serve the Guardian URL at `<path>` if supported by this
  application.
* `/assets/<file>`: A convenience for DEV machines. Assets are CDNed in PROD
  and would not be available on DEV.


###Deploying

Deployment uses the [Magenta](https://github.com/guardian/deploy) library.


###Debugging

You can debug your local Frontend application, by attaching a debugger.

* Start Simple Build Tool in debug mode by typing `./sbt --debug`
* Build and run your application. See "Running" for steps.
* Use a debugger to attach to the remote Java process, on localhost:1044.

Any IDE debugger should be compatible. In IntelliJ, add a new Debug
Configuration, based on the Remote default.
Ensure the Transport is Socket, the Debugger mode is Attach, and the port is
set to 1044.
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
- [grunt-csdevmode](https://github.com/mattosborn/grunt-csdevmode)
