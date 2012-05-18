class java {

  # OpenJDK because https://lists.ubuntu.com/archives/ubuntu-security-announce/2011-December/001528.html
  # See here for manual Sun Java 6 install: http://blog.flexion.org/2012/01/16/install-sun-java-6-jre-jdk-from-deb-packages/
  package {
    "openjdk-6-source": ensure => present
  }

  file {
    "/etc/profile.d/java.sh":
      content => "export JAVA_HOME=/usr/lib/jvm/java-6-openjdk\nexport PATH=\$JAVA_HOME/bin:\$PATH\nexport JDK_HOME=\$JAVA_HOME\n"
  }
}
