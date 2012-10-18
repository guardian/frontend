# Integration Tests

## Usage

To run all features (except `@ignore`)

	$ mvn clean test

To run a particular tagged feature (e.g.`@network-front`, but not `@ignore`)

	$ mvn clean test -Dcucumber.options="src/test/resources --tags @network-front --tags ~@ignore \
	> --glue com/gu/test --format pretty --format html:target/cucumber-html-report"

Running on a different host (i.e. not `http://localhost:9000`)

 	$ mvn clean test -Dhost=http://beta.gucode.co.uk

Running through a proxy

 	$ mvn clean test -Dhttp_proxy=http://proxy.co.uk:1234

