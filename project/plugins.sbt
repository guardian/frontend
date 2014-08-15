// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  Classpaths.typesafeReleases,
  Resolver.sonatypeRepo("releases"),
  Resolver.typesafeRepo("releases")
)

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.3.2")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "0.7.1")
