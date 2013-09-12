# Identity

This sub-project handles the Guardian profile functionality.

## Running Identity locally

Identity runs securely on a separate subdomain. As such it isn't part
of the dev-build application. The project should be run alongside
dev-build if required. The `/nginx` dir contains instructions scripts
and configuration for getting nginx setup. After following these
instructions, you'll need to run Identity on port 9009 (it doesn't run
on the default port, 9000 because that would clash with the rest of
the application). You can do this by passing the port as an argument
to the run command or by using the idrun command, which adds the port
argument for you.

So to go into the Identity project:

  ./sbt012
  project identity

and then the following commands are equivalent:

  idrun
  run 9009

The former is encouraged, in case we ever need to change the port.

So the required steps are:

* configure and run nginx (see `/nginx`)
* update your hosts file (also described in `/nginx`)
* run the Identity subproject on port 9009
* start up the Identity API locally (see below)

With these in place, you'll be able to browse Identity on

  https://profile.thegulocal.com/

## Identity API

You'll also need the Identity API running locally which means checking
out the old Identity project, follow the steps in that project's
README to get it setup and then run the API using the ./start_api.sh
script. Come chat to us if you have any difficulties.
