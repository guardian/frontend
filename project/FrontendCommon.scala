import com.gu.deploy.PlayAssetHash._
import sbt._
import sbt.Keys._
import sbt.PlayProject._

object FrontendCommon extends Build {

  private val appName = "frontend-common"
  private val appVersion = "1.43-SNAPSHOT"

  private val appDependencies = Seq(
    "com.gu.openplatform" %% "content-api-client" % "1.15",
    "com.gu" %% "configuration" % "3.6",
    "org.jsoup" % "jsoup" % "1.6.2",
    "org.jboss.dna" % "dna-common" % "0.6",
    "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6",
    "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6",
    "org.scalatest" %% "scalatest" % "1.7.1" % "test",
    "com.gu" %% "management-play" % "5.8",
    "com.gu" %% "management-logback" % "5.8"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)
    .settings(playAssetHashCompileSettings: _*)
    .settings(
      organization := "com.gu",

      // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
      testOptions in Test := Nil,

      // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
      unmanagedClasspath in Test <+= (baseDirectory) map { bd => Attributed.blank(bd / "test") },

      resolvers += "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",

      // Do not publish JavaDoc
      publishArtifact in (Compile, packageDoc) := false,

      publishTo <<= (version) { version: String =>
          val publishType = if (version.endsWith("SNAPSHOT")) "snapshots" else "releases"
          Some(
              Resolver.file(
                  "guardian github " + publishType,
                  file(System.getProperty("user.home") + "/guardian.github.com/maven/repo-" + publishType)
              )
          )
      },

      templatesImport ++= Seq(
        "common._",
        "views._",
        "views.support._"
      )
  )
}
