import sbt._
import sbt.Keys._

object Plugins extends Build {

  val frontendPluginVersion = "1.9"

  //we automatically include some plugins (including the Play plugin) from frontend-build

  lazy val plugins = Project("frontend-article", file("."))
    .settings(resolvers += "sbt-idea-repo" at "http://mpeltonen.github.com/maven/")
    .dependsOn(uri("git://github.com/guardian/sbt-frontend-build.git#" + frontendPluginVersion))
}