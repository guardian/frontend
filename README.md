Frontend
========

The Guardian website frontend.

New developers quick-start
===========================

Frontend is a set of Play Framework 2 Scala applications.

Requirements
------------

* A Mac or Linux pc
* Installed Node.js (https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
* Installed npm (Node package manager - you quite possibly already have this) `sudo apt-get install npm`
* Installed GraphicsMagick
* Installed Grunt (build tool) `sudo npm -g install grunt-cli`
* Installed Ruby >= v1.9.x & [bundler](http://gembundler.com/) (You will already have this installed, but run `ruby -v` to check version number)

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

restart the machine.

For more info see http://www.cyberciti.biz/faq/linux-increase-the-maximum-number-of-open-files/

Configuration
-------------

You'll need a config file called _/etc/gu/install_vars_ with the following content :-

```
STAGE=DEV
INT_SERVICE_DOMAIN=gudev.gnl
EXT_SERVICE_DOMAIN=
```

And one called _~/.gu/frontend.properties_, ( alternatively _/gu/etc/frontend.properties_ ) with the following content :-

```
content.api.key=XXXX
content.api.host=http://XXXX
pa.api.key=XXXX
ophan.api.host=XXX
ophan.api.key=XXXX
```

Get the correct keys and hosts from another developer on the project (for external developers, sign up for a ContentApi key at http://guardian.mashery.com).

To set up a proxy

```
export proxy_host=proxy.somewhere.com
export proxy_port=1234
```

Running
-------

Assuming you have checked out this project, open a console and change directory into the root of the project.

Start Simple Build Tool (sbt) by running `./sbt012`

Once sbt is running (it may take a while first time) then compile the project by typing `compile` (also can take a while first time)

Switch project by typing `project dev-build`

Now start the local server by typing `run` (this too will take long the first time)

Now test you are up and running by hitting the following URLs:
   * http://localhost:9000/books
   * http://localhost:9000/media/2012/dec/05/newspaper-editors-sign-up-leveson
   * http://localhost:9000/news/gallery/2012/dec/04/24-hours-in-pictures-gallery


To use in Eclipse, use the `eclipsify` command. This will create Eclipse
project and settings files which can be imported using the Import Existing
Project options in Eclipse.

To use in IntelliJ, see https://github.com/mpeltonen/sbt-idea

Further information on using the Play console is available [here][play2-console].


Endpoints
---------
The available endpoints are listed in `conf/routes` of each application and
typically include:

* `/management`: Operations support as per standard webapp guidelines. See
  guardian-management.
* `/pages/<path>`: Serve the Guardian URL at `<path>` if supported by this
  application.
* `/assets/<file>`: A convenience for DEV machines. Assets are CDNed in PROD
  and would not be available on DEV.
* `/<path>`: A synonym for `/pages/<path>` as a convenience for DEV machines.


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
Further documentation notes and useful items can be found in `dev`.


[sbt]: http://www.scala-sbt.org
[play2-console]: https://github.com/playframework/Play20/wiki/PlayConsole
[play2-wiki]: https://github.com/playframework/Play20/wiki
[sbteclipse]: https://github.com/typesafehub/sbteclipse
[sbt-idea]: https://github.com/mpeltonen/sbt-idea
[magenta]: https://github.com/guardian/deploy





