import sbt._
import sbt.Keys._
import sbt.PlayProject._

import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy
import templemore.xsbt.cucumber.CucumberPlugin
import RequireJsPlugin._
import RequireJsPlugin.RequireJsKeys._

import net.liftweb.json.JsonDSL._

object Frontend extends Build with Prototypes with Testing {
  val version = "1-SNAPSHOT"

  val jasmine = integrationTests("jasmine", "integration-tests")
    .settings(
      CucumberPlugin.cucumberFeaturesDir := new File("./integration-tests/src/test/resources/com/gu/test/common.feature")
    )

  val common = library("common")
    .settings(requireJsSettings: _*)
    .settings(
      // require js settings
      buildProfile in (Compile, requireJs) <<= (baseDirectory, resourceManaged) { (base, resources) => 
        (
          ("baseUrl" -> (base.getAbsolutePath + "/app/assets/javascripts")) ~
          ("name" -> "bootstraps/app") ~
          ("out" -> (resources.getAbsolutePath + "/main/public/javascripts/bootstraps/app.js")) ~
          ("paths" ->
            ("bean"         -> "components/bean/bean") ~
            ("bonzo"        -> "components/bonzo/src/bonzo") ~
            ("domReady"     -> "components/domready/ready") ~
            ("EventEmitter" -> "components/eventEmitter/src/EventEmitter") ~
            ("qwery"        -> "components/qwery/mobile/qwery-mobile") ~
            ("reqwest"      -> "components/reqwest/src/reqwest") ~
            ("domwrite"     -> "components/dom-write/dom-write") ~
            ("swipe"        -> "components/swipe/swipe")
          ) ~
          ("wrap" -> 
            ("startFile" -> (base.getAbsolutePath + "/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js")) ~
            ("endFile" -> (base.getAbsolutePath + "/app/assets/javascripts/bootstraps/go.js"))
          ) ~
          ("optimize" -> "uglify2") ~
          ("preserveLicenseComments" -> false)
        )
      },
      resourceGenerators in Compile <+=  requireJs in (Compile, requireJs)
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

  val football = application("football").dependsOn(commonWithTests).settings(
    libraryDependencies += "com.gu" %% "pa-client" % "2.7",
    templatesImport ++= Seq("pa._")
  )

  val image = application("image").dependsOn(commonWithTests)
    .settings(
       libraryDependencies ++= Seq(
         "org.imgscalr" % "imgscalr-lib" % "4.2",
         "commons-io" % "commons-io" % "2.0.1",
         "commons-lang" % "commons-lang" % "2.5"
       )
   )

  val diagnostics = application("diagnostics").dependsOn(commonWithTests)
    .settings(
      libraryDependencies ++= Seq(
        "net.sf.uadetector" % "uadetector-resources" % "2012.08",
        "net.sf.opencsv" % "opencsv" % "2.3"
      ),

      mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
        {
          case s: String if s.endsWith("DEV.properties") => MergeStrategy.first
          case x => old(x)
        }
      }
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
    .dependsOn(image)
    .dependsOn(coreNavigation)
    .dependsOn(router)
    .dependsOn(diagnostics)

  val main = root().aggregate(
    jasmine,
    common,
    front,
    article,
    section,
    tag,
    video,
    gallery,
    football,
    image,
    coreNavigation,
    router,
    diagnostics,
    dev
  )
}
