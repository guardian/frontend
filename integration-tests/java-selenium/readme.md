Introduction
============
The purpose of this module is to create integration and functional tests which test the frontend UI applications as black box using Selenium Webdriver. The main focus point of the test will initially be Facia "backed" pages/applications. Meaning those that are rendered based on pressed.json which is produced and retrieved from Amazon Web Service. Currently the tests can ONLY be run against prod and only once the changes are merged into master and deployed to prod. Reason is that it depends on custom HTML attributes to find elements on the pages.


How to run
===========

Prerequisites
-------------
* Java 7 (will not work with Java 8)
* Maven 3 (might work with Maven 2)
* Firefox 26+
* OS - Should work in Windows 7, Linux Ubuntu/Mint and Mac OS, assuming other prerequities are met). For Mac OS X make sure that you have JAVA_HOME property set to a Java 7 installation, otherwise Maven may not pick it up properly, even if you have it installed. E.g. add "export JAVA_HOME="/usr”” to your .bash_profile"

It has been tested on Linux Mint 17, Open JDK 7, Maven 3 and Firefox 26.

Running the tests
-----------------
Simply change to the root of this frontend and execute
```
cd integration-tests/java-selenium/
mvn clean verify
```
