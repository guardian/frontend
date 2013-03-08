import sbt._

object Plugins extends Build {

  // NOTE - NO source dependency plugins allowed in this project
  // either use a properly packaged dependency, or copy 'n paste the code
  // into the project.
  lazy val plugins = sbt.Project("build", file("."))
}
