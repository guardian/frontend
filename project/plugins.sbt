// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Sonatype OSS" at "https://oss.sonatype.org/content/repositories/releases/",
  Classpaths.typesafeReleases
)

// on a release candidate because of https://github.com/playframework/playframework/pull/3073
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.3.2-RC2")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "0.7.1")
