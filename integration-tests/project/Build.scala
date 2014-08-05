import sbt._
import Keys._

object RootBuild extends Build {

val commonSettings: Seq[Setting[_]] = Seq(
    version +=  "0.1.0-SNAPSHOT",
    resolvers ++= Seq(
        "Sonatype OSS Staging" at "https://oss.sonatype.org/content/repositories/staging",
        "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/"),
    libraryDependencies ++= Seq(
      "com.gu" %% "scala-automation" % "1.29-SNAPSHOT"
    )
  )

  lazy val commonTestLib = Project(id = "common-test-lib", base = file("common-test-lib"))
    .settings(commonSettings: _*)

  lazy val frontsIntegrationTests = Project(id = "fronts-integration-tests", base = file("scala-fw-tests"))
    .dependsOn(commonTestLib)
}
