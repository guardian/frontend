package com.gu

import com.gu.Dependencies._
import com.typesafe.sbt.web.Import._
import play.routes.compiler.InjectedRoutesGenerator
import play.sbt.Play.autoImport._
import play.sbt.routes.RoutesKeys
import play.twirl.sbt.Import._
import sbt.Keys._
import sbt._

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
      awsSts,
      awsSqs,
      contentApiClient,
      filters,
      commonsLang,
      configMagic,
      configMagicPlay,
      jodaConvert,
      jodaTime,
      jSoup,
      liftJson,
      json4s,
      playGoogleAuth,
      quartzScheduler,
      redisClient,
      rome,
      romeModules,
      scalaCheck,
      scalajTime,
      scalaz,
      ws,
      faciaFapiScalaClient,
      dispatchTest,
      closureCompiler,
      jerseyCore,
      jerseyClient,
      cssParser,
      w3cSac,
      logback,
      kinesisLogbackAppender,
      targetingClient
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
    RoutesKeys.routesGenerator := InjectedRoutesGenerator,
    libraryDependencies += scalaCheck
  )

  val article = application("article").dependsOn(commonWithTests).aggregate(common)
    .settings(RoutesKeys.routesGenerator := InjectedRoutesGenerator)

  val applications = application("applications")
    .dependsOn(commonWithTests)
    .aggregate(common)
    .settings(RoutesKeys.routesGenerator := InjectedRoutesGenerator)

  val archive = application("archive").dependsOn(commonWithTests).aggregate(common).settings(
    RoutesKeys.routesGenerator := InjectedRoutesGenerator
  )

  val sport = application("sport").dependsOn(commonWithTests).aggregate(common).settings(
    RoutesKeys.routesGenerator := InjectedRoutesGenerator,
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
    TwirlKeys.templateImports ++= Seq("discussion._", "discussion.model._"),
    RoutesKeys.routesGenerator := InjectedRoutesGenerator
  )

  val router = application("router")
    .settings(RoutesKeys.routesGenerator := InjectedRoutesGenerator)

  val diagnostics = application("diagnostics").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      uaDetectorResources
    ),
    RoutesKeys.routesGenerator := InjectedRoutesGenerator
  )

  val admin = application("admin").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      paClient,
      dfpAxis,
      bootstrap,
      jquery,
      jqueryui,
      lodash,
      react,
      epoch,
      d3,
      awsElasticloadbalancing,
      awsSes,
      scalaUri
    ),
    RoutesKeys.routesGenerator := InjectedRoutesGenerator,
    RoutesKeys.routesImport += "bindables._",
    RoutesKeys.routesImport += "org.joda.time.LocalDate"
  )

  val faciaPress = application("facia-press").dependsOn(commonWithTests).settings(
    RoutesKeys.routesGenerator := InjectedRoutesGenerator,
    libraryDependencies ++= Seq(
      awsKinesis
    )
  )

  val identity = application("identity").dependsOn(commonWithTests).aggregate(common).settings(
    RoutesKeys.routesGenerator := InjectedRoutesGenerator,
    libraryDependencies ++= Seq(
      filters,
      identityModel,
      identityRequest,
      identityCookie,
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
      .settings(
        libraryDependencies ++= List(shadeMemcached),
        RoutesKeys.routesGenerator := InjectedRoutesGenerator
      )

  val onward = application("onward").dependsOn(commonWithTests).aggregate(common)
    .settings(
      RoutesKeys.routesGenerator := InjectedRoutesGenerator
    )

  val adminJobs = application("admin-jobs")
    .dependsOn(commonWithTests)
    .aggregate(common)
    .settings(
      RoutesKeys.routesGenerator := InjectedRoutesGenerator
    )

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
      RoutesKeys.routesGenerator := InjectedRoutesGenerator,
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
    onward,
    adminJobs
  ).settings(
    RoutesKeys.routesGenerator := InjectedRoutesGenerator
  )

  val preview = application("preview").dependsOn(commonWithTests, standalone).settings(
    RoutesKeys.routesImport += "scala.language.reflectiveCalls",
    RoutesKeys.routesGenerator := InjectedRoutesGenerator
  )

  val trainingPreview = application("training-preview").dependsOn(commonWithTests, standalone).settings(
    RoutesKeys.routesImport += "scala.language.reflectiveCalls",
    RoutesKeys.routesGenerator := InjectedRoutesGenerator
  )

  val integrationTests = Project("integrated-tests", file("integrated-tests"))
    .settings(frontendCompilationSettings:_*)
    .settings(frontendIntegrationTestsSettings:_*)

  val rss = application("rss")
    .dependsOn(commonWithTests)
    .aggregate(common)
    .settings(RoutesKeys.routesGenerator := InjectedRoutesGenerator)

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
