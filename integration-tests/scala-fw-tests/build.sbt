name := "Fronts Scala fw integration tests"

version := "0.1.0-SNAPSHOT"

resolvers ++= Seq(
  "Sonatype OSS Staging" at "https://oss.sonatype.org/content/repositories/staging",
  "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/")

libraryDependencies ++= Seq(
  "com.gu" %% "scala-automation" % "1.15-SNAPSHOT"
)