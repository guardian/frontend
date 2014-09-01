import sbt._
import Keys._

object Build extends Build {
  val commonSettings: Seq[Setting[_]] = Seq(
    version += "0.1.0-SNAPSHOT",
    resolvers ++= Seq(
      "Sonatype OSS Staging" at "https://oss.sonatype.org/content/repositories/staging",
      "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/"),
    libraryDependencies ++= Seq(
      "com.gu" %% "scala-automation" % "1.34",
      "com.sun.mail" % "javax.mail" % "1.5.2",
      "com.sun.mail" % "imap" % "1.5.2"
    )
  )

  lazy val commonTestLib = Project(id = "common-test-lib", base = file("common-test-lib"))
    .settings(commonSettings: _*)

  lazy val frontendIntegrationTests = Project(id = "frontend-tests", base = file("frontend-tests"))
    .dependsOn(commonTestLib)

  lazy val identityIntegrationTests = Project(id = "identity-tests", base = file("identity-tests"))
    .dependsOn(commonTestLib)
}
