# Integration Tests

We are using [Cucumber JVM](https://github.com/cucumber/cucumber-jvm) to run integration tests.

## Guidance

- We very much favour high-level, imperative style tests.
- Features should describe an actual end-user benefit.

## Usage

As a prerequisite you'll need to run the dev-build on your localhost

    $ ./sbt001
    $ sbt> project dev-build
    $ sbt> run 9000

To run all features (except `@ignore`)

	$ mvn test

To run a particular tagged feature (e.g.`@network-front`, but not `@ignore`)

	$ mvn test -Dtags="--tags @network-front --tags ~@ignore"

Running on a different host (i.e. not `http://localhost:9000`)

 	$ mvn test -Dhost=http://beta.gucode.co.uk

Running through a proxy

 	$ mvn test -Dhttp_proxy=http://proxy.co.uk:1234
 	
To run the jasmine tests

	$ mvn test -Dtags="--tags @jasmine"

