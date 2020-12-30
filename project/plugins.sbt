// Additional information on initialization
logLevel := Level.Warn

// Dependencies used by the VersionInfo plugin
libraryDependencies ++= Seq(
  "joda-time" % "joda-time" % "2.3",
  "org.joda" % "joda-convert" % "1.7",
)

resolvers ++= Seq(
  Classpaths.typesafeReleases,
  Resolver.sonatypeRepo("releases"),
  Resolver.typesafeRepo("releases"),
  Resolver.url("guardian sbt-plugins", new URL("https://dl.bintray.com/guardian/sbt-plugins/"))(
    Resolver.ivyStylePatterns,
  ),
  Resolver.url("sbt sbt-plugins", new URL("https://dl.bintray.com/sbt/sbt-plugin-releases/"))(
    Resolver.ivyStylePatterns,
  ),
  Resolver.url(
    "bintray-sbt-plugin-releases",
    url("https://dl.bintray.com/content/sbt/sbt-plugin-releases"),
  )(Resolver.ivyStylePatterns),
)

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.6.7")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.3.1")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.3.3")

addSbtPlugin("com.gu" % "sbt-riffraff-artifact" % "1.0.0")

addSbtPlugin("com.typesafe.sbt" % "sbt-git" % "0.9.3")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.4.0")

addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.0")
