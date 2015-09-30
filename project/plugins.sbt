// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  Classpaths.typesafeReleases,
  Resolver.sonatypeRepo("releases"),
  Resolver.typesafeRepo("releases"),
  Resolver.url("guardian sbt-plugins", new URL("https://dl.bintray.com/guardian/sbt-plugins/"))(Resolver.ivyStylePatterns),
  Resolver.url("sbt sbt-plugins", new URL("https://dl.bintray.com/sbt/sbt-plugin-releases/"))(Resolver.ivyStylePatterns)
)

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.4.0")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.0.3")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.1.9")

addSbtPlugin("org.jetbrains.teamcity.plugins" % "sbt-teamcity-logger" % "0.3.0")

addSbtPlugin("com.gu" % "sbt-riffraff-artifact" % "0.8.1")
