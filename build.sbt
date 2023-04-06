import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport._
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
      okhttp,
    ) ++ jackson,
  )
  .settings(
    TestAssets / mappings ~= filterAssets,
  )

val commonWithTests = withTests(common)

val sanityTest = application("sanity-tests")
  .settings(
    // Evict vulnerable versions of jackson-databind
    libraryDependencies += jacksonDatabind,
  )

val facia = application("facia")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies += scalaCheck,
  )

val article = application("article").dependsOn(commonWithTests).aggregate(common)

val applications = application("applications")
  .dependsOn(commonWithTests)
  .aggregate(common)

val archive = application("archive")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
  )

val sport = application("sport")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      paClient,
    ),
  )

val discussion = application("discussion").dependsOn(commonWithTests).aggregate(common)

val diagnostics = application("diagnostics")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      redisClient,
    ),
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
  )

val faciaPress = application("facia-press")
  .dependsOn(commonWithTests)
  .settings(
    libraryDependencies ++= Seq(
      awsKinesis,
    ),
  )

val identity = application("identity")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      filters,
      identityAuthPlay,
      http4sCore,
      slf4jExt,
      libPhoneNumber,
      supportInternationalisation,
    ),
    PlayKeys.playDefaultPort := 9009,
    Test / testOptions += Tests.Argument("-oF"),
  )

val commercial = application("commercial").dependsOn(commonWithTests).aggregate(common)

val onward = application("onward").dependsOn(commonWithTests).aggregate(common)

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
  .settings(
  )

val rss = application("rss")
  .dependsOn(commonWithTests)
  .aggregate(common)

val search = application("search")
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
    search,
  )
  .settings(
    riffRaffUploadArtifactBucket := Some(
      System.getenv().getOrDefault("RIFF_RAFF_ARTIFACT_BUCKET", "aws-frontend-teamcity"),
    ),
    riffRaffUploadManifestBucket := Some(
      System.getenv().getOrDefault("RIFF_RAFF_BUILD_BUCKET", "aws-frontend-teamcity"),
    ),
    riffRaffManifestProjectName := s"dotcom:all",
    riffRaffArtifactResources := Seq(
      (admin / Universal / packageBin).value -> s"${(admin / name).value}/${(admin / Universal / packageBin).value.getName}",
      (applications / Universal / packageBin).value -> s"${(applications / name).value}/${(applications / Universal / packageBin).value.getName}",
      (archive / Universal / packageBin).value -> s"${(archive / name).value}/${(archive / Universal / packageBin).value.getName}",
      (article / Universal / packageBin).value -> s"${(article / name).value}/${(article / Universal / packageBin).value.getName}",
      (commercial / Universal / packageBin).value -> s"${(commercial / name).value}/${(commercial / Universal / packageBin).value.getName}",
      (diagnostics / Universal / packageBin).value -> s"${(diagnostics / name).value}/${(diagnostics / Universal / packageBin).value.getName}",
      (discussion / Universal / packageBin).value -> s"${(discussion / name).value}/${(discussion / Universal / packageBin).value.getName}",
      (identity / Universal / packageBin).value -> s"${(identity / name).value}/${(identity / Universal / packageBin).value.getName}",
      (facia / Universal / packageBin).value -> s"${(facia / name).value}/${(facia / Universal / packageBin).value.getName}",
      (faciaPress / Universal / packageBin).value -> s"${(faciaPress / name).value}/${(faciaPress / Universal / packageBin).value.getName}",
      (onward / Universal / packageBin).value -> s"${(onward / name).value}/${(onward / Universal / packageBin).value.getName}",
      (preview / Universal / packageBin).value -> s"${(preview / name).value}/${(preview / Universal / packageBin).value.getName}",
      (rss / Universal / packageBin).value -> s"${(rss / name).value}/${(rss / Universal / packageBin).value.getName}",
      (sport / Universal / packageBin).value -> s"${(sport / name).value}/${(sport / Universal / packageBin).value.getName}",
      baseDirectory.value / "riff-raff.yaml" -> "riff-raff.yaml",
    ),
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
