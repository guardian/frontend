# Integration Tests

## Usage

To run all features (except `@ignore`)

 $ mvn clean test

To run a particular tagged feature (excecpt `@ignore`)

 $ mvn clean test -Dcucumber.options="--tags @network-front --tags ~@ignore --glue classpath:com/gu/test \
 > src/test/resources --format pretty --format html:target/cucumber-html-report"