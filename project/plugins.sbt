// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Templemore Repository" at "http://templemore.co.uk/repo",
  Classpaths.typesafeResolver
)

addSbtPlugin("play" % "sbt-plugin" % "2.1-RC1")

addSbtPlugin("com.typesafe.sbt" % "sbt-scalariform" % "1.0.0")

addSbtPlugin("templemore" % "sbt-cucumber-plugin" % "0.7.0")