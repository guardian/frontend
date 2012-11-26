// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Templemore Repository" at "http://templemore.co.uk/repo",
  "Sonatype OSS" at "https://oss.sonatype.org/content/repositories/releases/",
  Classpaths.typesafeResolver
)

addSbtPlugin("play" % "sbt-plugin" % "2.0.4")

addSbtPlugin("com.typesafe.sbt" % "sbt-scalariform" % "1.0.0")

addSbtPlugin("templemore" % "xsbt-cucumber-plugin" % "0.5.0")
    
addSbtPlugin("org.scalatra.requirejs" % "sbt-requirejs" % "0.0.4-SNAPSHOT")
