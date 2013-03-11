// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Templemore Repository" at "http://templemore.co.uk/repo",
  "Sonatype OSS" at "https://oss.sonatype.org/content/repositories/releases/",
  Classpaths.typesafeResolver
)

addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "1.2.0")

addSbtPlugin("play" % "sbt-plugin" % "2.1.0")

addSbtPlugin("com.typesafe.sbt" % "sbt-scalariform" % "1.0.1")

//addSbtPlugin("templemore" % "xsbt-cucumber-plugin" % "0.7.2")

addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "0.8.5")

addSbtPlugin("com.gu" % "sbt-teamcity-test-reporting-plugin" % "1.3")