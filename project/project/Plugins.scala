import sbt._
import sbt.Keys._

object Plugins extends Build {

  val playAssetHashPluginVersion = "1.2"

  //we automatically include some plugins (including the Play plugin) from sbt-play-assethash

  lazy val plugins = Project("frontend-article", file("."))
    .settings(resolvers += "sbt-idea-repo" at "http://mpeltonen.github.com/maven/")
    .dependsOn(uri("git://github.com/guardian/sbt-play-assethash.git#" + playAssetHashPluginVersion))
}