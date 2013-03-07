import sbt._

object Plugins extends Build {

  val teamcityReportingPluginVersion = "1.2"

  //TODO get rid of all source dependencies
  lazy val plugins = sbt.Project("build", file(".")).
    dependsOn(uri("git://github.com/guardian/sbt-teamcity-test-reporting-plugin.git#" + teamcityReportingPluginVersion))
}
