// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Templemore Repository" at "http://templemore.co.uk/repo",
  "Typesafe Snapshots" at "http://repo.typesafe.com/typesafe/snapshots/"
  Classpaths.typesafeResolver
)

addSbtPlugin("play" % "sbt-plugin" % "2.1-SNAPSHOT")

addSbtPlugin("com.typesafe.sbt" % "sbt-scalariform" % "1.0.0")

addSbtPlugin("templemore" % "sbt-cucumber-plugin" % "0.7.0")