
import sbt._

object Plugins extends Build {
  val playArtifactPluginVersion = "play2.2.0_3"

  lazy val plugins = Project("main", file(""))
    .dependsOn(uri("git://github.com/guardian/sbt-play-artifact.git#" + playArtifactPluginVersion))
}
