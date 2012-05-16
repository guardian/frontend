import sbt._

object Plugins extends Build {

  val playAssetHashPluginVersion = "1.5"

  // We automatically include some plugins (including the Play plugin) from sbt-play-assethash.

  lazy val plugins = Project("frontend-article", file(".")).
//    dependsOn(uri("git://github.com/guardian/sbt-play-assethash.git#" + playAssetHashPluginVersion))
    dependsOn(uri("file:///home/docrual/frontend/sbt-play-assethash"))
}
