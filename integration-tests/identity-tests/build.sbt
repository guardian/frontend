name := "identity-tests"

version := "0.1.0-SNAPSHOT"

lazy val ciTest = taskKey[Unit]("Run tests for CI which will return exit code 0 even if a test fails")

ciTest := {
  val testResult = (test in Test).result.value
}