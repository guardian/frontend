package com.gu

import sbt._
import sbt.Keys._
import play.Play.autoImport._
import PlayKeys._
import play._
import play.twirl.sbt.Import._
import com.typesafe.sbt.web.Import._
import Dependencies._

object Frontend extends Build with Prototypes {

  val common = application("common").settings(
    libraryDependencies ++= Seq(
      akkaAgent,
      apacheCommonsMath3,
      awsSdk,
      contentApiClient,
      crosswordsApiClient,
      faciaScalaClient,
      filters,
      flexibleContentBlockToText,
      flexibleContentBodyParser,
      googleSheetsApi,
      guardianConfiguration,
      jacksonCore,
      jacksonMapper,
      jSoup,
      liftJson,
      playGoogleAuth,
      panDomainAuth,
      quartzScheduler,
      rome,
      romeModules,
      scalaCheck,
      scalajTime,
      scalaTestPlus,
      scalaz,
      shadeMemcached,
      snappyJava,
      ws,
      faciaFapiScalaClient
    )
  ).settings(
      mappings in TestAssets ~= filterAssets
  )

  val crosswordsRouting: Seq[Def.Setting[_]] = Seq(
    routesImport += "bindables._",
    routesImport += "com.gu.crosswords.api.client.models.{Type => CrosswordType}"
  )

  private def filterAssets(testAssets: Seq[(File, String)]) = testAssets.filterNot{ case (file, fileName) =>
    // built in sbt plugins did not like the bower files
    fileName.endsWith("bower.json")
  }

  def withTests(project: Project) = project % "test->test;compile->compile"

  val commonWithTests = withTests(common)

  val sanityTest = application("sanity-tests")

  val facia = application("facia").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies += scalaCheck
  )

  val article = application("article").dependsOn(commonWithTests).aggregate(common)
  val applications = application("applications")
    .dependsOn(commonWithTests)
    .settings(crosswordsRouting: _*)
    .aggregate(common)

  val archive = application("archive").dependsOn(commonWithTests).aggregate(common)
  val sport = application("sport").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      paClient,
      akkaContrib
    ),
    TwirlKeys.templateImports ++= Seq(
      "pa._",
      "feed._",
      "football.controllers._"
    )
  )

  val image = application("image")

  val discussion = application("discussion").dependsOn(commonWithTests).aggregate(common).settings(
    TwirlKeys.templateImports ++= Seq("discussion._", "discussion.model._")
  )

  val router = application("router")

  val diagnostics = application("diagnostics").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      uaDetectorResources,
      openCsv
    )
  )

  val admin = application("admin").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      postgres,
      paClient,
      dfpAxis,
      anorm,
      jdbc
    ),
    routesImport += "bindables._",
    routesImport += "org.joda.time.LocalDate"
  )

  val faciaTool = application("facia-tool").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      playJsonVariants
    )
  )

  val faciaPress = application("facia-press").dependsOn(commonWithTests)

  val identity = application("identity").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      filters,
      identityModel,
      identityRequest,
      identityCookie,
      seeGuice,
      guice,
      liftJson,
      commonsHttpClient,
      slf4jExt,
      exactTargetClient,
      nScalaTime
    )
  )

  val commercial = application("commercial").dependsOn(commonWithTests).aggregate(common)

  val onward = application("onward").dependsOn(commonWithTests).aggregate(common)

  val weather = application("weather")
    .dependsOn(commonWithTests)
    .aggregate(common)

  val dev = application("dev-build")
    .dependsOn(
      withTests(article)
    ).dependsOn(
      facia,
      applications,
      archive,
      sport,
      discussion,
      diagnostics,
      identity,
      admin,
      commercial,
      onward
    ).settings(crosswordsRouting: _*)

  val faciaEndToEnd = application("facia-end-to-end")
    .dependsOn(commonWithTests)
    .dependsOn(facia, faciaTool, faciaPress)
    .aggregate(common, facia, faciaTool, faciaPress)

  // this app has a very limited set.
  // it is designed to get all other services (e.g. onwards) from PROD
  val standalone = application("standalone").dependsOn(
    article,
    facia,
    applications,
    sport,
    commercial,
    onward
  )

  val preview = application("preview").dependsOn(withTests(common), standalone).settings(
    routesImport += "scala.language.reflectiveCalls"
  )

  val trainingPreview = application("training-preview").dependsOn(withTests(common), standalone).settings(
    routesImport += "scala.language.reflectiveCalls"
  )

  val integrationTests = Project("integrated-tests", file("integrated-tests"))
    .settings(frontendCompilationSettings:_*)
    .settings(frontendIntegrationTestsSettings:_*)

  val pngResizer = application("png-resizer")
    .dependsOn(commonWithTests)
    .aggregate(common)
    .settings(
      libraryDependencies += im4java
    )

  val rss = application("rss")
    .dependsOn(commonWithTests)
    .aggregate(common)

  val main = root().aggregate(
    common,
    facia,
    faciaTool,
    faciaPress,
    article,
    applications,
    sport,
    image,
    pngResizer,
    discussion,
    router,
    diagnostics,
    admin,
    identity,
    commercial,
    onward,
    archive,
    preview,
    trainingPreview,
    rss,
    weather
  )
}
