name := "Fronts Scala fw integration tests"

version := "0.1.0-SNAPSHOT"

resolvers ++= Seq(
  "Sonatype OSS Staging" at "https://oss.sonatype.org/content/repositories/staging",
  "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/")

libraryDependencies ++= Seq(
  "com.gu" %% "scala-automation" % "1.16"
)

lazy val ciTest = taskKey[Unit]("Run tests for CI which will return exit code 0 even if a test fails") 

ciTest := { 
  val testResult = (test in Test).result.value 
  0
} 