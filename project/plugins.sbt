// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Sonatype OSS" at "https://oss.sonatype.org/content/repositories/releases/",
  Classpaths.typesafeResolver
)

// Libraries required for building the project specification files.
libraryDependencies ++= Seq(
  "commons-codec" % "commons-codec" % "1.8"
)

addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "1.5.1")

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.2.0")

addSbtPlugin("com.typesafe.sbt" % "sbt-scalariform" % "1.2.0")

addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "0.9.2")
