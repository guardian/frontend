// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Templemore Repository" at "http://templemore.co.uk/repo"
)

addSbtPlugin("play" % "sbt-plugin" % "2.1-07132012")

addSbtPlugin("com.typesafe.sbtscalariform" % "sbtscalariform" % "0.5.1")

addSbtPlugin("templemore" % "xsbt-cucumber-plugin" % "0.5.0")
