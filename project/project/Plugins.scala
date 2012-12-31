import sbt._

object Plugins extends Build {

  // We automatically include some plugins (including the Play plugin) from sbt-play-assethash.

  lazy val plugins = Project("build", file(".")).
    dependsOn(uri("git://github.com/guardian/sbt-play-assethash.git#2.4")).
    dependsOn(uri("git://github.com/ironsidevsquincy/sbt-requirejs.git#v0.3")).
    dependsOn(uri("git://github.com/guardian/sbt-jshint-plugin.git#1.0")).
    dependsOn(uri("git://github.com/guardian/sbt-teamcity-test-reporting-plugin.git#1.2"))
}
