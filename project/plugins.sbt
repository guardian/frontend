// Additional information on initialization
logLevel := Level.Warn

// Dependencies used by the VersionInfo plugin
libraryDependencies ++= Seq(
  "joda-time" % "joda-time" % "2.14.2",
  "org.joda" % "joda-convert" % "3.0.1",
)

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.11")

addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.11.7")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.6.4")

addSbtPlugin("com.github.sbt" % "sbt-git" % "2.1.0")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.6.1")

addDependencyTreePlugin

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.13.1")

addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "0.14.6")
