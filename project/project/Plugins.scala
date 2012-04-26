import sbt._
import sbt.Keys._

object Plugins extends Build {

  val frontendPluginVersion = "1.10"

  //we automatically include some plugins (including the Play plugin) from frontend-build

  lazy val plugins = Project("frontend-views", file("."))
    .settings(
      resolvers += "sbt-idea-repo" at "http://mpeltonen.github.com/maven/",
      resolvers += "mvn repository" at "http://mvnrepository.com/artifact/"
    ).dependsOn(uri("git://github.com/guardian/sbt-frontend-build.git#" + frontendPluginVersion))
}