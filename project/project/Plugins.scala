import sbt._

object Plugins extends Build {

  val frontendPluginVersion = "1.7"

  //we automatically include some plugins (including the Play plugin) from frontend-build

  lazy val plugins = Project("frontend-article", file("."))
    .dependsOn(uri("git://github.com/guardian/sbt-frontend-build.git#" + frontendPluginVersion))
}