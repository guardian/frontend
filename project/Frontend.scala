import sbt._

import sbt.Keys._

import play.Project.{ requireJs => requireJsDoNotUse, _}
import SbtGruntPlugin._

import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy
//import templemore.xsbt.cucumber.CucumberPlugin
//import net.liftweb.json.JsonDSL._
//import org.sbtidea.SbtIdeaPlugin._

object Frontend extends Build with Prototypes with Testing {
  val version = "1-SNAPSHOT"

//  val jasmine = integrationTests("jasmine", "integration-tests")
//    .settings(
//      CucumberPlugin.cucumberFeaturesDir := new File("./integration-tests/src/test/resources/com/gu/test/common.feature")
//    )

  val common = library("common")
      .settings(
        (test in Test) <<= (test in Test) dependsOn (gruntTask("test")),
        resources in Compile <<=  (resources in Compile) dependsOn (gruntTask("compile"))
      )
    //.dependsOn(jasmine % "test->test")

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
    .dependsOn(common)
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
    //jasmine,
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
