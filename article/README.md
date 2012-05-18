Frontend Article
================

The article rendering components for the Guardian website.


Getting started for new developers
----------------------------------
Frontend Article is a Play Framework 2 Scala application.

To start the play development environment, run the provided `sbt011` script
in the sourcetree root. This performs a number of additional configuration
tasks, and starts the Play Framework console. Use the `compile` command
to compile the software, `run` to run the development application, and
`test` to execute test suites.

To use in Eclipse, use the `eclipsify` command. This will create Eclipse
project and settings files which can be imported using the Import Existing
Project options in Eclipse.

To use in IntelliJ, use the `gen-idea` command from the. This will create
IntelliJ project directories. The source tree can be opened directly as 
a project in IntelliJ.

Start the Play application locally using `run` at the console. You can
inspect it at `http://localhost:9000`. Play supports recompilation on browser
refresh so you can edit the code in your IDE and F5 refresh to see your
changes.

Further information on using the Play console is available [here][play2-console].


Endpoints
---------
The available endpoints are listed in `conf/routes` and include:

* TBD


Deploying
---------
TBD


No Proxy Build
--------------
Invoke `sbt011` with a `--no-proxy` parameter to directly download artifacts.


Vagrant virtualisation (optional)
---------------------------------
[Vagrant][vagrant] is a tool to "create and configure lightweight, reproducible, and portable
development environments." Vagrant itself is a virtual instance creation and startup
tool on top of Oracle VirtualBox which takes care of the virtualisation.

Install the Open Source Edition of VirtualBox and Vagrant itself:

    sudo apt-get install virtualbox-ose
    wget http://files.vagrantup.com/packages/aafa79fe66db687da265d790d5e67a2a7ec30d92/vagrant_1.0.0_x86_64.deb
    sudo dpkg -i vagrant_1.0.0_x86_64.deb

The vagrant instance to use is the one defined here:

    https://github.com/daithiocrualaoich/vagrants/tree/master/frontend_article_lucid64

Build this if the prebuilt version at the following location is unreachable:

    http://devscreen.gudev.gnl/vagrants/frontend_article_lucid64.box

It is convenient to start the instance in the root of the sourcetree:

    /opt/vagrant/bin/vagrant init frontend_article64 http://devscreen.gudev.gnl/vagrants/frontend_article_lucid64.box
    /opt/vagrant/bin/vagrant up

As a temporary measure until API key distribution is organised, you will need to
copy a useful `/etc/gu/frontend-article.properties`. Developers should be able to
copy the necessary `frontend-article.properties` from their dev box proper to the
sourceroot and then onto `/etc/gu` in the virtual instance.

Do not check in `frontend-article.properties`.

SSH onto the virtual instance, copy `frontend-article.properties` and start the app:

    /opt/vagrant/bin/vagrant ssh
    $ cd /vagrant
    $ sudo cp frontend-article.properties /etc/gu
    $ ./sbt011 run

The instance forwards port 80 on the virtual box to port 8000 on the developer box proper so the application should be
available at:

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
