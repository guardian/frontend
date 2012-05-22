// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  Resolver.url("Play 2.1-SNAPSHOT", url("http://guardian.github.com/ivy/repo-snapshots"))(Resolver.ivyStylePatterns),
  Classpaths.typesafeResolver
)

addSbtPlugin("play" % "sbt-plugin" % "2.1-SNAPSHOT")

addSbtPlugin("com.typesafe.sbtscalariform" % "sbtscalariform" % "0.4.0")