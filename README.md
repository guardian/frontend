Frontend
========
The Guardian website frontend.


Core Development Principles (lines in the sand)
===============================================

This applies to all requests on `www.theguardian.com` and `api.nextgen.guardianapps.co.uk` (our Ajax URL)

On the server
-------------

* Every request can be cached and has an appropriate Cache-Control header set.
* Each request may only perform 1 I/O operation on the backend. (you cannot make 2 calls to the content API or any
  other 3rd party)
* The average response time of any endpoint is less than 500ms.
* Requests that take longer than 2 seconds will be terminated.

New developers quick-start
===========================
Frontend is a set of Play Framework 2 Scala applications.

Configuration
-------------
You need 2 files on your machine.

The first file is called `/etc/gu/install_vars` and has the following contents...
```
STAGE=DEV
```

The second file is called `[YOUR_HOME_DIR]/.gu/frontend.properties` and you can get its contents from a shared
document. Ask your team mates to share it with you. If it has already been shared with you just search for "frontend.properties" in your documents.

Vagrant
-------
You can run the project with the supplied Vagrantfile - make sure you understand what vagrant is http://www.vagrantup.com/

* You need Virtualbox and Vagrant - on Ubuntu `sudo apt-get install virtualbox vagrant` otherwise see http://docs.vagrantup.com/v2/installation/index.html
* change directory into the folder where this README is located
* `vagrant up` - this will take a while, make some coffee
* You can now get onto the box by `vagrant ssh`
* the project is located in /vagrant so `cd /vagrant`
* `./sbt`


Local Install Requirements
--------------------------
* A Mac or Linux pc
* Installed Node.js (https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
* Installed npm (Node package manager - you quite possibly already have this)
* Installed GraphicsMagick
* Installed Grunt (build tool) `sudo npm -g install grunt-cli`
* Installed Ruby >= v1.9.x & [bundler](http://gembundler.com/) (You may already have this installed, but run `ruby -v` to check version number)


NPM ownership
-------------
Sometimes when you install npm it ends up owned by root (but in your home directory).

Check that you own your own .npm directory `ls -ld ~/.npm`

If it is owned by root then take ownership of it `sudo chown -R username:username ~/.npm`


File handles
------------
On Linux machines you may run into a "too many files open" error during compilation or reloading. You can find out
how many file handles you are allowed per process by running `ulimit -n`. This can be quite low, e.g. 1024

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

Running
-------
Assuming you have checked out this project, open a console and change directory
into the root of the project.

Frontend is built in two parts, using Grunt for the client side asset build and
SBT for the Play Framework backend. Neither of these tools are much use for
building the other half of the project and coupling them together with an
integration is one of those bad ideas that is even worse than it sounds.

Start the Grunt build and watch for development changes:

```
./grunt watch
```

In another console, start Simple Build Tool (sbt) by running `./sbt`. It may
take a while to start the first time. Once SBT is running, switch project by
typing `project dev-build`. Then compile and run the project locally by typing
`run`. This also can take a while first time.

Now test you are up and running by hitting the following URLs:
   * http://localhost:9000/books
   * http://localhost:9000/media/2012/dec/05/newspaper-editors-sign-up-leveson
   * http://localhost:9000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery

Play Framework will recompile code changes on refresh.

To create project files for use in IntelliJ, run the `idea` task from the root
SBT project. see https://github.com/mpeltonen/sbt-idea

Further information on using the Play console is available [here][play2-console].


Endpoints
---------
The available endpoints are listed in `conf/routes` of each application and
typically include:

* `/management`: Operations support as per standard webapp guidelines. See
  guardian-management.
* `/<path>`: Serve the Guardian URL at `<path>` if supported by this
  application.
* `/assets/<file>`: A convenience for DEV machines. Assets are CDNed in PROD
  and would not be available on DEV.


Deploying
---------
Deployment uses the [Magenta][magenta] library.


Debugging
---------
You can debug your local Frontend application, by attaching a debugger.

* Start Simple Build Tool in debug mode by typing `./sbt012 --debug`
* Build and run your application. See "Running" for steps.
* Use a debugger to attach to the remote Java process, on localhost:1044.

Any IDE debugger should be compatible. In IntelliJ, add a new Debug Configuration, based on the Remote default.
Ensure the Transport is Socket, the Debugger mode is Attach, and the port is set to 1044.
Start a new Debug session, and your breakpoints should be active.


Additional Documentation
------------------------
Further documentation notes and useful items can be found in `docs`.


[sbt]: http://www.scala-sbt.org
[play2-console]: https://github.com/playframework/Play20/wiki/PlayConsole
[play2-wiki]: https://github.com/playframework/Play20/wiki
[sbteclipse]: https://github.com/typesafehub/sbteclipse
[sbt-idea]: https://github.com/mpeltonen/sbt-idea
[magenta]: https://github.com/guardian/deploy





