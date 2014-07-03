Automation
===================

The tests requires updating the property for the saucelabs URL. 
The property updated can be found in src/main/resources/base.properties and needs to be updated to something like this:
``saucelabs.remotedriver.url=http://YOURUSERNAME:ACCESSTOKEN@ondemand.saucelabs.com:80/wd/hub``
If you don't have a saucelabs account, talk to your QA and make sure NOT to commit or push the file with the sauce labs url and credentials

An alternative to updating base.properties is to provide your own private properties file and then provide the location of your property override file by setting an environment property: TEST_PROPERTY_OVERRIDE_PATH=<path to your property file>. See javadoc for com.gu.test.PropertyLoader for further details. Example: ``mvn test  -DTEST_PROPERTY_OVERRIDE_PATH=/home/shahin/local-config.properties``
This will override only those properties which you define in that file.

The tests on integration will run with a generic user. 

To test against code:
Go to the Webdriver directory and run ``mvn test``


To run on your local machine, edit baseUrl in the config.properties class to point to your localhost.
