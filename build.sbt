import play.sbt.routes.RoutesKeys
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.gu.Dependencies._
import com.gu.ProjectSettings._

/*
We need to set a wide width here because otherwise the output from
the `dependencyTree` command can get truncated, especially for nested projects.
The output from `dependencyTree` is used by Snyk to monitor our dependencies.
If the output is truncated, Snyk might report false positives.
See
https://support.snyk.io/hc/en-us/articles/9590215676189-Deeply-nested-Scala-projects-have-dependencies-truncated
 */
ThisBuild / asciiGraphWidth := 999999999

val common = library("common")
  .settings(
    Test / javaOptions += "-Dconfig.file=common/conf/test.conf",
    libraryDependencies ++= Seq(
      apacheCommonsLang,
      awsCore,
      awsCloudwatch,
      awsDynamodb,
      awsEc2,
      awsKinesis,
      awsS3,
      awsSns,
      awsSts,
      awsSqs,
      awsSsm,
      eTagCachingS3,
      nettyCodecHttp2,
      contentApiClient,
      enumeratumPlayJson,
      filters,
      commonsLang,
      jodaConvert,
      jodaTime,
      jSoup,
      json4s,
      playGoogleAuth,
      playSecretRotation,
      playSecretRotationAwsSdk,
      quartzScheduler,
      redisClient,
      rome,
      romeModules,
      scalaCheck,
      scalaCollectionPlus,
      nScalaTime,
      ws,
      faciaFapiScalaClient,
      closureCompiler,
      jerseyCore,
      jerseyClient,
      cssParser,
      w3cSac,
      logback2, // logback2: to prevent "error: reference to logback is ambiguous;"
      kinesisLogbackAppender,
      targetingClient,
      scanamo,
      scalaUri,
      commercialShared,
      playJson,
      playJsonExtensions,
      playJsonJoda,
      jodaForms,
      jacksonDataFormat,
      atomRenderer,
      identityModel,
      capiAws,
      pekkoActor,
      pekkoStream,
      pekkoSlf4j,
    ) ++ jackson,
    TestAssets / mappings ~= filterAssets,
    dependencyOverrides += contentApiClient
  )

val commonWithTests = withTests(common)

val facia = application("facia")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies += scalaCheck,
    dependencyOverrides += contentApiClient
  )

val article = application("article")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(dependencyOverrides += contentApiClient)

val applications = application("applications")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(dependencyOverrides += contentApiClient)

val archive = application("archive")
  .dependsOn(commonWithTests)
  .aggregate(common)

val sport = application("sport")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      paClient,
    ),
    dependencyOverrides += contentApiClient
  )

val discussion = application("discussion")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(dependencyOverrides += contentApiClient)

val diagnostics = application("diagnostics")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      redisClient,
    ),
    dependencyOverrides += contentApiClient,
  )

val admin = application("admin")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
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
      scalaUri,
    ),
    RoutesKeys.routesImport += "bindables._",
    RoutesKeys.routesImport += "org.joda.time.LocalDate",
    dependencyOverrides += contentApiClient,
  )

val faciaPress = application("facia-press")
  .dependsOn(commonWithTests)
  .settings(
    libraryDependencies ++= Seq(
      awsKinesis,
    ),
    dependencyOverrides += contentApiClient,
  )

val identity = application("identity")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      filters,
      identityAuthPlay,
      slf4jExt,
      libPhoneNumber,
      supportInternationalisation,
    ),
    dependencyOverrides ++= jackson,
    dependencyOverrides += contentApiClient,
    PlayKeys.playDefaultPort := 9009,
    Test / testOptions += Tests.Argument("-oF"),
  )

val commercial = application("commercial")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(dependencyOverrides += contentApiClient)

val onward = application("onward")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(dependencyOverrides += contentApiClient)

val dev = application("dev-build")
  .dependsOn(
    withTests(article),
  )
  .dependsOn(
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
  )
  .settings(
    RoutesKeys.routesImport += "bindables._",
    Runtime / javaOptions += "-Dconfig.file=dev-build/conf/dev-build.application.conf",
    dependencyOverrides += contentApiClient,
    dependencyOverrides ++= jackson,
  )

val preview = application("preview")
  .dependsOn(
    commonWithTests,
    article,
    facia,
    applications,
    sport,
    commercial,
    onward,
  )

val rss = application("rss")
  .dependsOn(commonWithTests)
  .aggregate(common)


val main = root()
// This evicts the version of
// "com.fasterxml.jackson.core:jackson-databind"
// used by "com.typesafe.play:sbt-plugin"
  .settings(
    libraryDependencies ++= Seq(
      jacksonDatabind,
    ),
  )
  .aggregate(
    common,
    facia,
    faciaPress,
    article,
    applications,
    sport,
    discussion,
    diagnostics,
    admin,
    identity,
    commercial,
    onward,
    archive,
    preview,
    rss,
  )
val badgeHash = inputKey[Unit]("Generate special badge salts and hashes")
badgeHash := {
  import java.math.BigInteger
  import java.security.MessageDigest
  import complete.DefaultParsers._
  import java.util.UUID

  val result = spaceDelimited("<arg>").parsed.headOption
    .map { tag =>
      val salt = UUID.randomUUID.toString.replaceAll("-", "")
      val saltedTag = salt + tag
      val digest = MessageDigest.getInstance("MD5")
      digest.update(saltedTag.getBytes(), 0, saltedTag.length)
      val hash = new BigInteger(1, digest.digest()).toString(16)
      s"salt=$salt\nhash=$hash"
    }
    .getOrElse {
      "error: expected tag parameter"
    }

  println(result)
}
