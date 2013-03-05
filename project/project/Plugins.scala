import sbt._

object Plugins extends Build {

  //val sbtRequireJsVersion = "v0.3"
  val sbtGruntVersion = "0.1"
  val sbtJsHintVersion = "1.0"
  val teamcityReportingPluginVersion = "1.2"

  lazy val plugins = sbt.Project("build", file(".")).
    //dependsOn(uri("git://github.com/ironsidevsquincy/sbt-requirejs.git#" + sbtRequireJsVersion)).
    dependsOn(uri("git://github.com/guardian/sbt-grunt-plugin.git#" + sbtGruntVersion)).
    dependsOn(uri("git://github.com/guardian/sbt-jshint-plugin.git#" + sbtJsHintVersion)).
    dependsOn(uri("git://github.com/guardian/sbt-teamcity-test-reporting-plugin.git#" + teamcityReportingPluginVersion))
}
