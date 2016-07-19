package com.gu

import com.gu.Dependencies._
import com.gu.riffraff.artifact.RiffRaffArtifact
import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport._
import com.gu.versioninfo.VersionInfo
import com.typesafe.sbt.SbtNativePackager._
import com.typesafe.sbt.packager.Keys._
import com.typesafe.sbt.packager.universal.UniversalPlugin
import play.sbt.PlayScala
import play.twirl.sbt.Import._
import sbt.Keys._
import sbt._

trait Prototypes {
  val version = "1-SNAPSHOT"

  val frontendCompilationSettings = Seq(
    organization := "com.gu",
    maxErrors := 20,
    javacOptions := Seq("-g","-encoding", "utf8"),
    scalacOptions := Seq("-unchecked", "-deprecation", "-target:jvm-1.8",
      "-Xcheckinit", "-encoding", "utf8", "-feature", "-Yinline-warnings","-Xfatal-warnings"),
    doc in Compile <<= target.map(_ / "none"),
    incOptions := incOptions.value.withNameHashing(true),
    scalaVersion := "2.11.8",
    initialize := {
      val _ = initialize.value
      assert(sys.props("java.specification.version") == "1.8",
        "Java 8 is required for this project.")
    }
  )

  val frontendIntegrationTestsSettings = Seq (
    concurrentRestrictions in ThisProject := List(Tags.limit(Tags.Test, 1)),
    testOptions in Test += Tests.Argument("-oDF"),
    resolvers ++= Seq(Resolver.typesafeRepo("releases")),
    libraryDependencies ++= Seq(
      scalaTest,
      scalaTestPlus,
      seleniumJava % Test,
      jodaTime % Test,
      jodaConvert % Test,
      akkaAgent % Test
    )
  )

  val frontendDependencyManagementSettings = Seq(
    ivyXML :=
      <dependencies>
        <exclude org="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
        <exclude org="org.springframework"><!-- Because I don't like it. --></exclude>
        <exclude org="org.specs2"><!-- because someone thinks it is acceptable to have this as a prod dependency --></exclude>
      </dependencies>,

    resolvers ++= Seq(
      Resolver.typesafeRepo("releases"),
      Resolver.sonatypeRepo("releases"),
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
      "Guardian Frontend Bintray" at "https://dl.bintray.com/guardian/frontend",
      "Spy" at "https://files.couchbase.com/maven2/"
    ),

    evictionWarningOptions in update := EvictionWarningOptions.default
      .withWarnTransitiveEvictions(false)
      .withWarnDirectEvictions(false)
      .withWarnScalaVersionEviction(false)
  )

  val frontendClientSideSettings = Seq(

    TwirlKeys.templateImports ++= Seq(
      "common._",
      "model._",
      "views._",
      "views.support._",
      "conf._",
      "play.api.Play",
      "play.api.Play.current"
    )
  )

  val frontendTestSettings = Seq(
    // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
    testOptions in Test := Nil,

    concurrentRestrictions in Global := {
      val processorsCount = java.lang.Runtime.getRuntime.availableProcessors()
      println(processorsCount)
      List(Tags.limit(Tags.Test, if(parallelExecution.value) processorsCount else 1))
    },

    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    unmanagedClasspath in Test <+= baseDirectory map { bd => Attributed.blank(bd / "test") },

    libraryDependencies ++= Seq(
      scalaTest,
      scalaTestPlus,
      mockito
    ),

    // These settings are needed for forking, which in turn is needed for concurrent restrictions.
    javaOptions in Test += "-DAPP_SECRET=this_is_not_a_real_secret_just_for_tests",
    javaOptions in Test += "-Xmx2048M",
    javaOptions in Test += "-XX:+UseConcMarkSweepGC",
    javaOptions in Test += "-XX:ReservedCodeCacheSize=128m",
    baseDirectory in Test := file("."),

    // Set testResultLogger back to the default, fixes an issue with `sbt-teamcity-logger`
    //   See: https://github.com/JetBrains/sbt-tc-logger/issues/9
    testResultLogger in (Test, test) := TestResultLogger.Default
  )

  val testAll = taskKey[Unit]("test all aggregate projects")
  val uploadAll = taskKey[Unit]("upload all riff-raff artifacts from aggregate projects")
  val testThenUpload = taskKey[Unit]("Conditional task that uploads to riff raff only if tests pass")

  def frontendRootSettings= List(
    testAll := (test in Test).all(ScopeFilter(inAggregates(ThisProject, includeRoot = false))).value,
    uploadAll := riffRaffUpload.all(ScopeFilter(inAggregates(ThisProject, includeRoot = false))).value,

    testThenUpload := Def.taskDyn({
     testAll.result.value match {
       case Inc(inc) => Def.task[Unit] {
         println("Tests failed, no riff raff upload will be performed.")
         throw inc
       }
       case Value(_) => {
         println("Tests passed, uploading artifacts to riff raff.")
         uploadAll.toTask
       }
     }
    }).value
  )

  def frontendDistSettings(application: String) = List(
    packageName in Universal := application,
    topLevelDirectory in Universal := Some(application),
    concurrentRestrictions in Universal := List(Tags.limit(Tags.All, 1)),
    riffRaffPackageType := (packageBin in Universal).value,
    riffRaffBuildIdentifier := System.getenv().getOrDefault("BUILD_NUMBER", "0").replaceAll("\"",""),
    riffRaffUploadArtifactBucket := Some(System.getenv().getOrDefault("RIFF_RAFF_ARTIFACT_BUCKET", "aws-frontend-teamcity")),
    riffRaffUploadManifestBucket := Some(System.getenv().getOrDefault("RIFF_RAFF_BUILD_BUCKET", "aws-frontend-teamcity")),
    riffRaffArtifactPublishPath := application,
    riffRaffManifestProjectName := s"dotcom:$application",
    riffRaffPackageName := s"dotcom:$application",
    riffRaffArtifactResources := Seq(
      riffRaffPackageType.value -> s"packages/$application/${riffRaffPackageType.value.getName}",
      baseDirectory.value / "deploy.json" -> "deploy.json"
    ),
    artifactName in Universal := { (sv: ScalaVersion, module: ModuleID, artifact: Artifact) =>
      artifact.name + "." + artifact.extension
    }
  )

  def root() = Project("root", base = file(".")).enablePlugins(PlayScala)
    .settings(frontendCompilationSettings)
    .settings(frontendRootSettings)

  def application(applicationName: String) = {
    Project(applicationName, file(applicationName)).enablePlugins(PlayScala, RiffRaffArtifact, UniversalPlugin)
    .settings(frontendDependencyManagementSettings)
    .settings(frontendCompilationSettings)
    .settings(frontendClientSideSettings)
    .settings(frontendTestSettings)
    .settings(VersionInfo.settings)
    .settings(libraryDependencies ++= Seq(macwire, commonsIo))
    .settings(frontendDistSettings(applicationName))
    .settingSets(settingSetsOrder)
  }

  def library(applicationName: String) = {
    Project(applicationName, file(applicationName)).enablePlugins(PlayScala)
    .settings(frontendDependencyManagementSettings)
    .settings(frontendCompilationSettings)
    .settings(frontendClientSideSettings)
    .settings(frontendTestSettings)
    .settings(VersionInfo.settings)
    .settings(libraryDependencies ++= Seq(commonsIo))
    .settings(riffRaffUpload := {})
    .settingSets(settingSetsOrder)
  }

  /**
   * Overrides the default order in which settings are applied.
   * Modified this so that settings from "nonAutoPlugins" (plugins using the older sbt plugin API)
   * are applied before settings defined in build.scala
   *
   * Required for resetting the `testResultLogger` in `frontendTestSettings` above
   *
   * Default:
   *   AddSettings.allDefaults: AddSettings = seq(autoPlugins, buildScalaFiles, userSettings, nonAutoPlugins, defaultSbtFiles)
   */
  lazy val settingSetsOrder = {
    import AddSettings._

    seq(autoPlugins, nonAutoPlugins, buildScalaFiles, userSettings, defaultSbtFiles)
  }
}
