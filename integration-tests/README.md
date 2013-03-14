Integration Tests
=================

Set-up
------

For use with Eclipse

    $ mvn eclipse:eclipse

Usage
-----

To run all features (except `@ignore` and `@scala-test`)

	$ mvn test

To run a particular tagged feature (e.g.`@network-front`, but not `@ignore` or `@scala-test`)

	$ mvn test -Dtags="--tags @network-front"

Running on a different host (i.e. not `http://localhost:9000`)

 	$ mvn test -Dhost=http://m.gucode.co.uk

Running through a proxy

 	$ mvn test -Dhttp_proxy=http://proxy.co.uk:1234

Running on a different driver (e.g. `htmlUnit`, `chrome`, `firefox` (default))

    $ mvn test -Ddriver=htmlUnit

Running in Chrome will trigger a profile ignoring all tests tagged `@brokeninchrome`. [ChromeDriver](http://code.google.com/p/selenium/wiki/ChromeDriver) must be installed in your PATH.

    $ mvn test -Ddriver=chrome
     	
To run the jasmine tests

	$ mvn test -Dtags="--tags @jasmine"