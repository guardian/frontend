Frontend
========

The Guardian website frontend.


Getting started for new developers
----------------------------------
Frontend is a set of Play Framework 2 Scala applications.

To start the play development environment, run the provided `sbt011` script
in the source tree root. This starts the Play Framework console.

Requirements
------------

 * [Node.js](http://nodejs.org) (if you're having issues, try installing it with a [package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager) 

Configuration
-------------

You'll need a config file in _/etc/gu/install_vars_ as follows :-

```
STAGE=DEV
INT_SERVICE_DOMAIN=gudev.gnl
EXT_SERVICE_DOMAIN=
```

And one for each application in _~/.gu_, for example _~/.gu/frontend-article.properties_ :-

```
content.api.key=xxx
content.api.host=http://xxx.guardianapis.com/api
```

Get the correct key and host from another developer on the project.

Running
-------

Change to the project of interest using the `project <name>` command. Then use
the `compile` command to compile the software, `test` to execute test suites.

Start the Play application locally using `run` at the console. You can
inspect it at `http://localhost:9000`. Play supports recompilation on browser
refresh so you can edit the code in your IDE and F5 refresh to see your
changes.

To use in Eclipse, use the `eclipsify` command. This will create Eclipse
project and settings files which can be imported using the Import Existing
Project options in Eclipse.

To use in IntelliJ, use the `gen-idea` command from the. This will create
IntelliJ project directories. The source tree can be opened directly as 
a project in IntelliJ.

Further information on using the Play console is available [here][play2-console].

Virtualisation
--------------
Virtualisation provides for robust development environments and a controlled
system dependency solution. See the instructions in `README.vagrant.md` for
using [Vagrant][vagrant] virtualisation with this project.


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


No Proxy Build
--------------
Invoke `sbt011` with a `--no-proxy` parameter to directly download artifacts.


Additional Documentation
------------------------
Further documentation notes and useful items can be found in `dev`.


[sbt]: http://www.scala-sbt.org
[play2-console]: https://github.com/playframework/Play20/wiki/PlayConsole
[play2-wiki]: https://github.com/playframework/Play20/wiki
[sbteclipse]: https://github.com/typesafehub/sbteclipse
[sbt-idea]: https://github.com/mpeltonen/sbt-idea
[vagrant]: http://vagrantup.com
[magenta]: https://github.com/guardian/deploy
