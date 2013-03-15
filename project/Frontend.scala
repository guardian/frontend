import sbt._

import sbt.Keys._

import play.Project._
import SbtGruntPlugin._

import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy

object Frontend extends Build with Prototypes with Testing {
  val version = "1-SNAPSHOT"

  val javascriptFiles = SettingKey[PathFinder]("javascript-files", "All javascript")
  val cssFiles = SettingKey[PathFinder]("css-files", "All css")

  val common = library("common").settings(
    javascriptFiles <<= baseDirectory{ (baseDir) => baseDir \ "app" \ "assets" ** "*.js" },
    cssFiles <<= baseDirectory{ (baseDir) => baseDir \ "app" \ "assets" ** "*.scss" },
    (test in Test) <<= (test in Test) dependsOn (gruntTask("test")),
    resources in Compile <<=  (resources in Compile) dependsOn (gruntTask("compile:js", javascriptFiles), gruntTask("compile:css", cssFiles))
  )

  val commonWithTests = common % "test->test;compile->compile"

  val front = application("front").dependsOn(commonWithTests)
  val article = application("article").dependsOn(commonWithTests)
  val section = application("section").dependsOn(commonWithTests)
  val tag = application("tag").dependsOn(commonWithTests)
  val gallery = application("gallery").dependsOn(commonWithTests)
  val video = application("video").dependsOn(commonWithTests)
  val coreNavigation = application("core-navigation").dependsOn(commonWithTests)
  val router = application("router").dependsOn(commonWithTests)
  val styleGuide = application("style-guide").dependsOn(commonWithTests)
  val event = application("event").dependsOn(commonWithTests).settings(
    libraryDependencies += "com.novus" %% "salat" % "1.9.2-SNAPSHOT"
  )

  val football = application("football").dependsOn(commonWithTests).settings(
    libraryDependencies += "com.gu" %% "pa-client" % "3.0",
    templatesImport ++= Seq(
      "pa._",
      "feed._"
    )
  )

  val diagnostics = application("diagnostics").dependsOn(commonWithTests).settings(
    libraryDependencies ++= Seq(
      "net.sf.uadetector" % "uadetector-resources" % "2012.08",
      "net.sf.opencsv" % "opencsv" % "2.3"
    )
  )

  val dev = application("dev-build")
    .dependsOn(front)
    .dependsOn(article)
    .dependsOn(section)
    .dependsOn(tag)
    .dependsOn(video)
    .dependsOn(gallery)
    .dependsOn(football)
    .dependsOn(coreNavigation)
    .dependsOn(router)
    .dependsOn(diagnostics)
    .dependsOn(styleGuide)
    .dependsOn(event)

  val main = root().aggregate(
    common,
    front,
    article,
    section,
    tag,
    video,
    gallery,
    football,
    coreNavigation,
    router,
    diagnostics,
    dev,
    styleGuide,
    event
  )
}
