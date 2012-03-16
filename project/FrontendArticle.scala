import sbt._
import Keys._
import PlayProject._

object FrontendArticle extends Build {

  val appName = "frontend-article"
  val appVersion = "1-SNAPSHOT"

  val appDependencies = Seq(
    //dependencies included in distribution
    "com.gu.openplatform" %% "content-api-client" % "1.13",
    "com.gu" %% "configuration" % "3.6",
    "com.gu" %% "management-play" % "5.7",
    "com.gu" %% "management-logback" % "5.7",

    //dependencies in test only
    "org.scalatest" %% "scalatest" % "1.6.1" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
    // Disable Specs options to use ScalaTest
    testOptions in Test := Nil
  )
}
