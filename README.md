Frontend Article
================

The article rendering components for the Guardian website.


Getting started for new developers
----------------------------------
Frontend Article is a Play Scala application.

To start the play development environment, run the provided `play` script
in the sourcetree root. This performs a number of additional configuration
tasks, downloading and configuring the Play Framework in the `dev` directory,
and setting environment variables.

This script will download the Play Framework(first time only) so be patient.

The `play` script will start a standard Play Framework console. Use the
`compile` command to compile the software, `run` to run the development
application, and `test` to execute test suites.

To use in Eclipse, use the already configured `eclipse` command from the 
[SBT Eclipse plugin][sbteclipse] project. This will create Eclipse project
and settings files which can be imported using the Import Existing Project
options in Eclipse.

To use in IntelliJ, use the already configured `gen-idea` command from the
[SBT Idea plugin][sbt-idea]. This will create IntelliJ project directories.
The source tree can be opened directly as a project in IntelliJ.

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


Additional Documentation
------------------------
Further documentation notes and useful items can be found in `dev`.


[sbt]: http://www.scala-sbt.org
[play2-console]: https://github.com/playframework/Play20/wiki/PlayConsole
[play2-wiki]: https://github.com/playframework/Play20/wiki
[sbteclipse]: https://github.com/typesafehub/sbteclipse
[sbt-idea]: https://github.com/mpeltonen/sbt-idea