# Integration Tests

## Usage

To run all features (except `@ignore` and `@scala-test`)

	$ mvn test

To run a particular tagged feature (e.g.`@network-front`, but not `@ignore` or `@scala-test`)

	$ mvn test -Dtags="--tags @network-front"

Running on a different host (i.e. not `http://localhost:9000`)

 	$ mvn test -Dhost=http://beta.gucode.co.uk

Running through a proxy

 	$ mvn test -Dhttp_proxy=http://proxy.co.uk:1234
 	
To run the jasmine tests

	$ mvn test -Dtags="--tags @jasmine"