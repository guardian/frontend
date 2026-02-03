// Additional information on initialization
logLevel := Level.Warn

// Dependencies used by the VersionInfo plugin
libraryDependencies ++= Seq(
  "joda-time" % "joda-time" % "2.12.7",
  "org.joda" % "joda-convert" % "2.2.4",
)

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.10")

addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.11.7")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.6.4")

addSbtPlugin("com.github.sbt" % "sbt-git" % "2.1.0")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.5.6")

addDependencyTreePlugin

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.13.1")
