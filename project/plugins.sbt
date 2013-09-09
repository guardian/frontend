// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Templemore Repository" at "http://templemore.co.uk/repo",
  "Sonatype OSS" at "https://oss.sonatype.org/content/repositories/releases/",
  Classpaths.typesafeResolver
)

addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "1.3.0")

addSbtPlugin("play" % "sbt-plugin" % "2.1.3")

addSbtPlugin("com.typesafe.sbt" % "sbt-scalariform" % "1.0.1")

addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "0.9.0")

addSbtPlugin("com.gu" % "sbt-teamcity-test-reporting-plugin" % "1.3")