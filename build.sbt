import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport._
import play.sbt.Play.autoImport._
import play.sbt.routes.RoutesKeys
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.gu.Dependencies._
import com.gu.ProjectSettings._

val common = library("common").settings(
  javaOptions in Test += "-Dconfig.file=common/conf/test.conf",
  libraryDependencies ++= Seq(
    guBox,
    apacheCommonsMath3,
    awsCore,
    awsCloudwatch,
    awsDynamodb,
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
    liftJson,
    json4s,
    playGoogleAuth,
    quartzScheduler,
    redisClient,
    rome,
    romeModules,
    scalaCheck,
    nScalaTime,
    ws,
    faciaFapiScalaClient,
    closureCompiler,
    jerseyCore,
    jerseyClient,
    cssParser,
    w3cSac,
    logback,
    kinesisLogbackAppender,
    targetingClient,
    scanamo,
    scalaUri,
    commercialShared,
    playJson,
    playJsonJoda,
    jodaForms,
    jacksonDataFormat,
    atomRenderer,
    identityModel
  )
).settings(
    mappings in TestAssets ~= filterAssets
)

val commonWithTests = withTests(common)

val sanityTest = application("sanity-tests")

val facia = application("facia").dependsOn(commonWithTests).aggregate(common).settings(
  libraryDependencies += scalaCheck
)

val article = application("article").dependsOn(commonWithTests).aggregate(common)

val applications = application("applications")
  .dependsOn(commonWithTests).aggregate(common)

val archive = application("archive").dependsOn(commonWithTests).aggregate(common).settings(
)

val sport = application("sport").dependsOn(commonWithTests).aggregate(common).settings(
  libraryDependencies ++= Seq(
    paClient,
    akkaContrib
  )
)

val discussion = application("discussion").dependsOn(commonWithTests).aggregate(common)

val diagnostics = application("diagnostics").dependsOn(commonWithTests).aggregate(common).settings(
  libraryDependencies ++= Seq(
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
    scalaUri,
    playIteratees
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
    slf4jExt,
    exactTargetClient,
    libPhoneNumber
  )
)

val commercial = application("commercial").dependsOn(commonWithTests).aggregate(common)

val onward = application("onward").dependsOn(commonWithTests).aggregate(common)

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
  ).settings(
    RoutesKeys.routesImport += "bindables._",
    javaOptions in Runtime += "-Dconfig.file=dev-build/conf/dev-build.application.conf"
  )

val preview = application("preview").dependsOn(
  commonWithTests,
  article,
  facia,
  applications,
  sport,
  commercial,
  onward
).settings(
)

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
  diagnostics,
  admin,
  identity,
  commercial,
  onward,
  archive,
  preview,
  rss
).settings(
  riffRaffBuildIdentifier := System.getenv().getOrDefault("BUILD_NUMBER", "0").replaceAll("\"",""),
  riffRaffUploadArtifactBucket := Some(System.getenv().getOrDefault("RIFF_RAFF_ARTIFACT_BUCKET", "aws-frontend-teamcity")),
  riffRaffUploadManifestBucket := Some(System.getenv().getOrDefault("RIFF_RAFF_BUILD_BUCKET", "aws-frontend-teamcity")),
  riffRaffManifestProjectName := s"dotcom:all",
  riffRaffArtifactResources := Seq(
    (packageBin in Universal in admin).value -> s"${(name in admin).value}/${(packageBin in Universal in admin).value.getName}",
    (packageBin in Universal in applications).value -> s"${(name in applications).value}/${(packageBin in Universal in applications).value.getName}",
    (packageBin in Universal in archive).value -> s"${(name in archive).value}/${(packageBin in Universal in archive).value.getName}",
    (packageBin in Universal in article).value -> s"${(name in article).value}/${(packageBin in Universal in article).value.getName}",
    (packageBin in Universal in commercial).value -> s"${(name in commercial).value}/${(packageBin in Universal in commercial).value.getName}",
    (packageBin in Universal in diagnostics).value -> s"${(name in diagnostics).value}/${(packageBin in Universal in diagnostics).value.getName}",
    (packageBin in Universal in discussion).value -> s"${(name in discussion).value}/${(packageBin in Universal in discussion).value.getName}",
    (packageBin in Universal in identity).value -> s"${(name in identity).value}/${(packageBin in Universal in identity).value.getName}",
    (packageBin in Universal in facia).value -> s"${(name in facia).value}/${(packageBin in Universal in facia).value.getName}",
    (packageBin in Universal in faciaPress).value -> s"${(name in faciaPress).value}/${(packageBin in Universal in faciaPress).value.getName}",
    (packageBin in Universal in onward).value -> s"${(name in onward).value}/${(packageBin in Universal in onward).value.getName}",
    (packageBin in Universal in preview).value -> s"${(name in preview).value}/${(packageBin in Universal in preview).value.getName}",
    (packageBin in Universal in rss).value -> s"${(name in rss).value}/${(packageBin in Universal in rss).value.getName}",
    (packageBin in Universal in sport).value -> s"${(name in sport).value}/${(packageBin in Universal in sport).value.getName}",
    baseDirectory.value / "riff-raff.yaml" -> "riff-raff.yaml"
  )
)
