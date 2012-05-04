import sbt._
import sbt.Keys._

object Plugins extends Build {

  val frontendPluginVersion = "1.15"

  //we automatically include some plugins (including the Play plugin) from frontend-build

  lazy val plugins = Project("frontend-common", file("."))
    .settings(
      resolvers ++= Seq(
        "sbt-idea-repo" at "http://mpeltonen.github.com/maven/",
        "mvn repository" at "http://mvnrepository.com/artifact/"
      ),

      externalResolvers <<= resolvers map { rs =>
        Resolver.withDefaultResolvers(rs, scalaTools = false)
      }
    )
    .dependsOn(uri("git://github.com/guardian/sbt-frontend-build.git#" + frontendPluginVersion))
}
