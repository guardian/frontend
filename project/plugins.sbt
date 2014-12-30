// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  Classpaths.typesafeReleases,
  Resolver.sonatypeRepo("releases"),
  Resolver.typesafeRepo("releases")
)

resolvers ++= Seq(Resolver.sonatypeRepo("snapshots"), Resolver.sbtPluginRepo("snapshots"))

addSbtPlugin("com.typesafe.sbt" % "sbt-twirl" % "1.1-SNAPSHOT")

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.3.2")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "0.7.1")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.1.7")
