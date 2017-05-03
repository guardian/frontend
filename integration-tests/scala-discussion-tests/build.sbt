name := "Discussion Automation Tests"

version := "2.0"

resolvers ++= Seq(
  "Sonatype OSS Staging" at "https://oss.sonatype.org/content/repositories/staging",
  "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/")

libraryDependencies ++= Seq(
  "com.gu" %% "scala-automation" % "1.22",
  "com.gu" %% "scala-automation-web-signin" % "1.0",
  "com.gu" %% "scala-automation-tstash-logger" % "1.0"
)