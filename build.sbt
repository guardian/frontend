import play.sbt.routes.RoutesKeys
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.typesafe.sbt.packager.archetypes.JavaAppPackaging.autoImport._
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
ThisBuild / scalaVersion := SCALA_VERSION

val templateTrackerJar = "template-tracker-agent.jar"

/*
 * Standalone JVM agent that records which Twirl templates are rendered at runtime.
 *
 * This is a pure java project that uses ByteBuddy to instrument the Twirl template classes at runtime
 * It is self-contained and any dependency is shadded to avoid any dependency conflict.
 *
 * The output of this module is a JAR file that gets attached to any service that requires this instrumentation
 */
val templateTrackerAgent = Project("template-tracker-agent", file("template-tracker-agent"))
  .settings(
    crossPaths := false, // pure Java: don't append a _2.13 suffix to the artifact
    autoScalaLibrary := false, // pure Java: no scala-library dependency
    libraryDependencies += byteBuddy,
    assembly / assemblyJarName := templateTrackerJar,
    assembly / assemblyShadeRules := Seq(
      ShadeRule.rename("net.bytebuddy.**" -> "com.gu.shaded.bytebuddy.@1").inAll,
    ),
    assembly / packageOptions += Package.ManifestAttributes(
      "Premain-Class" -> "com.gu.templatetracker.TemplateTrackerAgent",
      "Can-Redefine-Classes" -> "true",
      "Can-Retransform-Classes" -> "true",
    ),
  )

val withTwirlInstrumentation: Seq[SettingsDefinition] = Seq(
  Universal / mappings += {
    val agentJar = (templateTrackerAgent / assembly).value
    agentJar -> s"agent/${templateTrackerJar}"
  },
  bashScriptExtraDefines += s"""addJava "-javaagent:$${app_home}/../agent/${templateTrackerJar}"""",
)

val common = library("common")
  .settings(
    libraryDependencies ++= Seq(
      apacheCommonsLang,
      awsCloudwatch,
      awsDynamodb,
      awsKinesis,
      awsS3,
      awsSns,
      awsSts,
      awsSqs,
      awsSsm,
      eTagCachingS3,
      contentApiClient,
      contentApiModelsJson,
      enumeratumPlayJson,
      filters,
      commonsLang,
      jodaConvert,
      jodaTime,
      jSoup,
      json4s,
      panDomainAuth,
      editorialPermissions,
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
      logstash,
      targetingClient,
      scanamo,
      scalaUri,
      commercialShared,
      playJson,
      playJsonJoda,
      jodaForms,
      identityModel,
      capiAws,
      pekkoActor,
      pekkoStream,
      pekkoSlf4j,
      pekkoSerializationJackson,
      pekkoActorTyped,
      supportInternationalisation,
    ) ++ jackson,
  )

val commonWithTests = withTests(common)

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

val sport = application("sport")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      paClient,
    ),
  )

val discussion = application("discussion")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(withTwirlInstrumentation: _*)

val admin = application("admin")
  .dependsOn(commonWithTests)
  .aggregate(common)
  .settings(
    libraryDependencies ++= Seq(
      paClient,
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
      identityAuthCore,
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

val rss = application("rss")
  .dependsOn(commonWithTests)
  .aggregate(common)

val main = root()
  .aggregate(
    common,
    facia,
    faciaPress,
    article,
    applications,
    sport,
    discussion,
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
