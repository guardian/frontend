import com.gu.deploy.PlayAssetHash._
import sbt._
import sbt.Keys._
import sbt.PlayProject._
import sbtassembly.Plugin.AssemblyKeys._

object FrontendFront extends Build {

  private val appName = "frontend-front"
  private val appVersion = "1-SNAPSHOT"

  private val appDependencies = Seq(
    //dependencies included in distribution
    "com.gu" %% "management-play" % "5.8",
    "com.gu" %% "management-logback" % "5.8",
    "com.gu" %% "frontend-common" % "1.41",

    //dependencies in test only
    "org.scalatest" %% "scalatest" % "1.7.1" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)
    .settings(playAssetHashDistSettings: _*)
    .settings(
      organization := "com.gu",

      // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
      testOptions in Test := Nil,

      resolvers += "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",

      jarName in assembly := "%s.jar" format appName,

      templatesImport ++= Seq(
        "common._",
        "views._",
        "views.support._",
        "conf.Static"
      )
    )
}
