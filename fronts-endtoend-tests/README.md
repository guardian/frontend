## Configuration

Currently the only configuration file is the environment.properties file.
It contains the default settings, which should be overriden for local use.

To permanently override settings, create a developer.properties file adjacent to the main one.
For other environments, specifying settings through system properties, also works.

In your frontend.properties or developer.properties, add the following configuration:

```
test.username=
test.password=
test.GASecret=
```

To acquire your google account secret for 2 step authentication, follow the steps [described in this blog post](http://www.meza.hu/2014/02/havig-difficulties-testing-sites-with-2.html)


## IntelliJ setup

For some odd reason, sbt gen-idea marks the wrong directories.
What you need to do to get it working under intellij:

  1. Unmark ```src``` as Source Root
  2. Unmark ```src``` as Test Source Root
  3. Mark ```src/main/java``` as Source Root
  4. Unmark ```src/main/resources``` as Source Root
  5. Unmark ```src/main/resources``` as Test Source Root
  6. Mark ```src/main/resources``` as Source Root
  3. Mark ```src/test/java``` as Test Source Root
  3. Mark ```src/test/java``` as Test Source Root

The language level is not set from the sbt config either, so you have to manualy go to
```project structure settings``` select the ```fronts-endtoend-tests``` module and set the language level to 7
