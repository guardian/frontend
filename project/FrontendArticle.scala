import sbt._
import Keys._
import PlayProject._

object FrontendArticle extends Build {

    val appName = "frontend-article"
    val appVersion = "1-SNAPSHOT"

    val appDependencies = Seq(
      "org.scalatest" %% "scalatest" % "1.6.1" % "test"
    )

    val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
      // Disable Specs options to use ScalaTest
      testOptions in Test := Nil
    )

}
