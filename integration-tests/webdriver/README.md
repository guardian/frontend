Automation
===================

The tests require secret.properties added to the package with a saucelabs URL. 
Example of secret.properties file:
``hubUrl=http://YOURUSERNAME:ACCESSTOKEN@ondemand.saucelabs.com:80/wd/hub``
If you don't have a saucelabs account, talk to your QA. 
The tests on integration will run with a generic user. 


To test against code:
Go to the Webdriver directory and run ``mvn test``


To run on your local machine, edit baseUrl in the config.properties class to point to your localhost.