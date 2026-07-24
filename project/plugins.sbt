// Additional information on initialization
logLevel := Level.Warn

// Dependencies used by the VersionInfo plugin
libraryDependencies ++= Seq(
  "joda-time" % "joda-time" % "2.14.2",
  "org.joda" % "joda-convert" % "2.2.4",
)

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.11")

addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.11.7")

// Used to build the shaded, self-contained template-tracker JVM agent jar
addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "2.3.1")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.7.0")

addSbtPlugin("com.github.sbt" % "sbt-git" % "2.1.0")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.6.1")

addDependencyTreePlugin

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.13.1")

addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "0.14.7")
