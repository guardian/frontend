import sbt._

import sbt.Keys._

import play.Project._
import SbtGruntPlugin._

import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy

object Frontend extends Build with Prototypes with Testing {
  val version = "1-SNAPSHOT"

  val javascriptFiles = SettingKey[PathFinder]("javascript-files", "All javascript")

  val common = library("common").settings(
    javascriptFiles <<= baseDirectory{ (baseDir) => baseDir \ "app" \ "assets" ** "*.js" },
    (test in Test) <<= (test in Test) dependsOn (gruntTask("test")),
    resources in Compile <<=  (resources in Compile) dependsOn (gruntTask("compile", javascriptFiles))
  )

  val commonWithTests = common % "test->test;compile->compile"
  val coreNavigation = application("core-navigation").dependsOn(commonWithTests)
  val football = application("r2football").dependsOn(coreNavigation, commonWithTests).settings(
    libraryDependencies += "com.gu" %% "pa-client" % "4.0",
    templatesImport ++= Seq(
      "pa._",
      "feed._"
    )
  )

  val main = root().aggregate(
    common,
    football,
    coreNavigation
  )
}
