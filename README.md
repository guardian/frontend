Frontend
========

The Guardian website frontend.


Getting started for new developers
----------------------------------
Frontend is a set of Play Framework 2 Scala applications.

To start the play development environment, run the provided `sbt011` script
in the source tree root. This starts the Play Framework console.

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


Vagrant virtualisation (optional)
---------------------------------
[Vagrant][vagrant] is a tool to "create and configure lightweight, reproducible,
and portable development environments." Vagrant itself is a virtual instance
creation and startup tool on top of Oracle VirtualBox which takes care of the
virtualisation.

Install the Open Source Edition of VirtualBox and Vagrant itself:

    sudo apt-get install virtualbox-ose
    wget http://files.vagrantup.com/packages/aafa79fe66db687da265d790d5e67a2a7ec30d92/vagrant_1.0.0_x86_64.deb
    sudo dpkg -i vagrant_1.0.0_x86_64.deb

The vagrant instance to use is the one defined in `dev/vagrant/frontend_lucid64`.
There should be a prebuilt version at the following location:

    http://devscreen.gudev.gnl/vagrant/frontend_lucid64.box

If this is unreachable, build the package from scratch:

    cd dev/vagrant/frontend_lucid64.box
    /opt/vagrant/bin/vagrant up
    /opt/vagrant/bin/vagrant package --vagrantfile Vagrantfile --include ../manifests
    mv package.box frontend_lucid64.box

It is convenient to start the instance in the root of the source tree:

    /opt/vagrant/bin/vagrant init frontend http://devscreen.gudev.gnl/vagrants/frontend_article_lucid64.box
    /opt/vagrant/bin/vagrant up

As a temporary measure until API key distribution is organised, you will
need to copy a useful e.g. `/etc/gu/frontend-article.properties`. Developers
should be able to copy the necessary `frontend-article.properties` from
their dev box proper to the source root and then onto `/etc/gu` in the
virtual instance.

Do not check in `frontend-article.properties`.

SSH onto the virtual instance, copy `frontend-article.properties` and start
the app:

    /opt/vagrant/bin/vagrant ssh
    $ cd /vagrant
    $ sudo cp frontend-article.properties /etc/gu
    $ ./sbt011 run

The instance forwards port 80 on the virtual box to port 8000 on the developer
box proper so the application should be available at:

    http://localhost:8000

Since Play recompiles on refresh, you should be able to pretty much ignore the
instance from this point.


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
