package com.gu

import sbt._
import sbt.Keys._
import play.Play.autoImport._
import PlayKeys._
import play._
import play.sbt._
import play.sbt.routes.RoutesKeys
import play.twirl.sbt.Import._
import com.typesafe.sbt.web.Import._
import Dependencies._

object Frontend extends Build with Prototypes {

  val common = library("common").settings(
    libraryDependencies ++= Seq(
      akkaAgent,
      apacheCommonsMath3,
      awsCore,
      awsCloudwatch,
      awsDynamodb,
      awsS3,
      awsSns,
      awsSqs,
      contentApiClient,
      faciaScalaClient,
      filters,
      googleSheetsApi,
      guardianConfiguration,
      jacksonCore,
      jacksonMapper,
      jodaConvert,
      jodaTime,
      jSoup,
      liftJson,
      playGoogleAuth,
      quartzScheduler,
      rome,
      romeModules,
      scalaCheck,
      scalajTime,
      scalaz,
      snappyJava,
      ws,
      faciaFapiScalaClient,
      dispatchTest,
      closureCompiler,
      jerseyCore,
      jerseyClient,
      cssParser,
      w3cSac
    )
  ).settings(
      mappings in TestAssets ~= filterAssets
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

  val discussion = application("discussion").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      scalaUri
    ),
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
      paClient,
      dfpAxis,
      anormModule,
      bootstrap,
      jquery,
      jqueryui,
      lodash,
      react,
      awsElasticloadbalancing,
      awsSes,
      scalaUri
    ),
    RoutesKeys.routesImport += "bindables._",
    RoutesKeys.routesImport += "org.joda.time.LocalDate"
  )

  val faciaPress = application("facia-press").dependsOn(commonWithTests).settings(
    libraryDependencies ++= Seq(
      awsKinesis
    )
  )

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
      nScalaTime,
      dispatch,
      libPhoneNumber
    )
  )

  val commercial = application("commercial").dependsOn(commonWithTests).aggregate(common)
      .settings(libraryDependencies ++= List(shadeMemcached))

  val onward = application("onward").dependsOn(commonWithTests).aggregate(common)

  val adminJobs = application("admin-jobs")
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
      onward,
      adminJobs
    ).settings(
      RoutesKeys.routesImport += "bindables._",
      javaOptions in Runtime += "-Dconfig.file=dev-build/conf/dev-build.application.conf"
    )

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
    RoutesKeys.routesImport += "scala.language.reflectiveCalls"
  )

  val trainingPreview = application("training-preview").dependsOn(withTests(common), standalone).settings(
    RoutesKeys.routesImport += "scala.language.reflectiveCalls"
  )

  val integrationTests = Project("integrated-tests", file("integrated-tests"))
    .settings(frontendCompilationSettings:_*)
    .settings(frontendIntegrationTestsSettings:_*)

  val rss = application("rss")
    .dependsOn(commonWithTests)
    .aggregate(common)

  val main = root().aggregate(
    common,
    facia,
    faciaPress,
    article,
    applications,
    sport,
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
    adminJobs
  )
}
