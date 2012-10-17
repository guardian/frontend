# Integration Tests

## Usage

To run all features (except `@ignore`)

	$ mvn clean test

To run a particular tagged feature (excecpt `@ignore`)

	$ mvn clean test -Dcucumber.options="--tags @network-front --tags ~@ignore --glue classpath:com/gu/test \
 	> --format pretty --format html:target/cucumber-html-report src/test/resources"

Running on a different host (i.e. not `http://localhost:9000`)

 	$ mvn clean test -Dhost=http://beta.gucode.co.uk

Running through a proxy

 	$ mvn clean test -Dhttp_proxy=http://proxy.co.uk:1234