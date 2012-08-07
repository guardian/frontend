import sbt._

object Plugins extends Build {

  val playAssetHashPluginVersion = "1.14"
  val sbtRequireJsVersion = "0.4"
  val teamcityReportingPluginVersion = "1.2"

  // We automatically include some plugins (including the Play plugin) from sbt-play-assethash.

  lazy val plugins = Project("build", file(".")).
    dependsOn(uri("git://github.com/guardian/sbt-play-assethash.git#" + playAssetHashPluginVersion)).
    dependsOn(uri("git://github.com/guardian/sbt-requirejs.git#" + sbtRequireJsVersion)).
    dependsOn(uri("git://github.com/guardian/sbt-teamcity-test-reporting-plugin.git#" + teamcityReportingPluginVersion))

}
