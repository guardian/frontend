package com.gu

import akka.remote.transport.TestAssociationHandle
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
      guardianConfiguration,
      contentApiClient,
      akkaAgent,
      jSoup,
      jacksonCore,
      jacksonMapper,
      awsSdk,
      quartzScheduler,
      dnaCommon,
      scalajTime,
      apacheCommonsMath3,
      shadeMemcached,
      rome,
      romeModules,
      snappyJava,
      liftJson,
      playGoogleAuth,
      scalaCheck,
      "com.gu" %% "facia-api-client" % "0.6-SNAPSHOT",
      filters,
      ws
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
  val applications = application("applications").dependsOn(commonWithTests).aggregate(common)
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
      slick,
      postgres,
      paClient,
      dfpAxis,
      anorm,
      jdbc
    )
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

  val endtoend = application("fronts-endtoend-tests").settings(
    libraryDependencies ++= Seq(
      slf4jApi,
      logbackClassic,
      chargebee,
      jodaTime,
      mezaAao,
      mezaConfig,
      mezaGaLib,
      mezaHttpClientWrapper,
      commonsCodec,
      cucumberJava,
      cucumberJUnit,
      velocity,
      cucumberPicoContainer,
      seleniumJava,
      seleniumServer,
      jUnit,
      jUnitInterface
    ),
    testOptions += Tests.Argument(TestFrameworks.JUnit, "-q", "-v"),
    javacOptions ++= Seq("-source", "7", "-target", "1.8"),
    autoScalaLibrary := false,
    unmanagedSourceDirectories in Compile <+= baseDirectory(_ / "src"),
    unmanagedSourceDirectories in Test <+= baseDirectory(_ / "src"),
    unmanagedSourceDirectories in Runtime <+= baseDirectory(_ / "src"),
    unmanagedResourceDirectories in Compile <+= baseDirectory(_ / "src" / "main" / "resources"),
    unmanagedResourceDirectories in Runtime <+= baseDirectory(_ / "src" / "main" / "resources"),
    unmanagedResourceDirectories in Test <+= baseDirectory(_ / "src" / "main" / "resources"),
    unmanagedResourceDirectories in Test <+= baseDirectory(_ / "src" / "test" / "resources"),
    unmanagedResourceDirectories in Runtime <+= baseDirectory(_ / "src" / "test" / "resources")
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
      onward
    )

  // this app has a very limited set.
  // it is designed to get all other services (e.g. onwards) from PROD
  val preview = application("preview").dependsOn(
    withTests(common),
    article,
    facia,
    applications,
    sport,
    commercial,
    onward
  )

  val main = root().aggregate(
    common,
    facia,
    faciaTool,
    faciaPress,
    article,
    applications,
    sport,
    image,
    discussion,
    router,
    diagnostics,
    admin,
    identity,
    commercial,
    onward,
    archive,
    preview
  )
}
