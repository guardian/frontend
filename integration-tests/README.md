# Integration Tests

## Usage

To run all features (except `@ignore`)

	$ mvn clean test

To run a particular tagged feature (e.g.`@network-front`, but not `@ignore`)

	$ mvn clean test -Dtags="--tags @network-front --tags ~@ignore"

Running on a different host (i.e. not `http://localhost:9000`)

 	$ mvn clean test -Dhost=http://beta.gucode.co.uk

Running through a proxy

 	$ mvn clean test -Dhttp_proxy=http://proxy.co.uk:1234