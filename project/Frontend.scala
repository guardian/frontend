package com.gu

import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport._
import play.sbt.Play.autoImport._
import play.sbt.routes.RoutesKeys
import play.twirl.sbt.Import._
import com.typesafe.sbt.web.Import._
import Dependencies._
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
      targetingClient,
      scanamo
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

  val archive = application("archive").dependsOn(commonWithTests).aggregate(common).settings(
  )

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
      redisClient
    )
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
        libraryDependencies ++= List(shadeMemcached)
      )

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
    onward,
    adminJobs
  )

  val preview = application("preview").dependsOn(commonWithTests, standalone).settings(
    RoutesKeys.routesImport += "scala.language.reflectiveCalls"
  )

  val trainingPreview = application("training-preview").dependsOn(commonWithTests, standalone).settings(
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
  ).settings(
    riffRaffBuildIdentifier := System.getenv().getOrDefault("BUILD_NUMBER", "0").replaceAll("\"",""),
    riffRaffUploadArtifactBucket := Some(System.getenv().getOrDefault("RIFF_RAFF_ARTIFACT_BUCKET", "aws-frontend-teamcity")),
    riffRaffUploadManifestBucket := Some(System.getenv().getOrDefault("RIFF_RAFF_BUILD_BUCKET", "aws-frontend-teamcity")),
    riffRaffManifestProjectName := s"dotcom:all",
    riffRaffArtifactResources := Seq(
      (riffRaffPackageType in admin).value -> s"${(name in admin).value}/${(riffRaffPackageType in admin).value.getName}",
      (riffRaffPackageType in adminJobs).value -> s"${(name in adminJobs).value}/${(riffRaffPackageType in adminJobs).value.getName}",
      (riffRaffPackageType in applications).value -> s"${(name in applications).value}/${(riffRaffPackageType in applications).value.getName}",
      (riffRaffPackageType in archive).value -> s"${(name in archive).value}/${(riffRaffPackageType in archive).value.getName}",
      (riffRaffPackageType in article).value -> s"${(name in article).value}/${(riffRaffPackageType in article).value.getName}",
      (riffRaffPackageType in commercial).value -> s"${(name in commercial).value}/${(riffRaffPackageType in commercial).value.getName}",
      (riffRaffPackageType in diagnostics).value -> s"${(name in diagnostics).value}/${(riffRaffPackageType in diagnostics).value.getName}",
      (riffRaffPackageType in discussion).value -> s"${(name in discussion).value}/${(riffRaffPackageType in discussion).value.getName}",
      (riffRaffPackageType in identity).value -> s"${(name in identity).value}/${(riffRaffPackageType in identity).value.getName}",
      (riffRaffPackageType in facia).value -> s"${(name in facia).value}/${(riffRaffPackageType in facia).value.getName}",
      (riffRaffPackageType in faciaPress).value -> s"${(name in faciaPress).value}/${(riffRaffPackageType in faciaPress).value.getName}",
      (riffRaffPackageType in onward).value -> s"${(name in onward).value}/${(riffRaffPackageType in onward).value.getName}",
      (riffRaffPackageType in preview).value -> s"${(name in preview).value}/${(riffRaffPackageType in preview).value.getName}",
      (riffRaffPackageType in rss).value -> s"${(name in rss).value}/${(riffRaffPackageType in rss).value.getName}",
      (riffRaffPackageType in sport).value -> s"${(name in sport).value}/${(riffRaffPackageType in sport).value.getName}",
      (riffRaffPackageType in trainingPreview).value -> s"${(name in trainingPreview).value}/${(riffRaffPackageType in trainingPreview).value.getName}",
      baseDirectory.value / "riff-raff.yaml" -> "riff-raff.yaml"
    )
  )
}
