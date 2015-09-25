package com.gu

import com.gu.versioninfo.VersionInfo
import com.typesafe.sbt.packager.universal.UniversalPlugin
import sbt._
import sbt.Keys._
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.typesafe.sbt.SbtNativePackager._
import com.typesafe.sbt.packager.Keys._
import com.gu.riffraff.artifact.RiffRaffArtifact
import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport._
import play.twirl.sbt.Import._
import Dependencies._

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
    scalaVersion := "2.11.7",
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
      "Spy" at "https://files.couchbase.com/maven2/"
    ),

    updateOptions := updateOptions.value.withCachedResolution(true),

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

    concurrentRestrictions in Global := List(Tags.limit(Tags.Test, 4)),

    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    unmanagedClasspath in Test <+= baseDirectory map { bd => Attributed.blank(bd / "test") },

    libraryDependencies ++= Seq(
      scalaTest,
      mockito
    ),

    // These settings are needed for forking, which in turn is needed for concurrent restrictions.
    javaOptions in Test += "-DAPP_SECRET=this_is_not_a_real_secret_just_for_tests",
    javaOptions in Test += "-Xmx2048M",
    javaOptions in Test += "-XX:+UseConcMarkSweepGC",
    javaOptions in Test += "-XX:ReservedCodeCacheSize=128m",
    baseDirectory in Test := file(".")
  )

  def frontendDistSettings(application: String) = List(
    packageName in Universal := application,
    topLevelDirectory in Universal := Some(application),
    concurrentRestrictions in Universal := List(Tags.limit(Tags.All, 1)),
    riffRaffPackageType := (packageBin in Universal).value,
    riffRaffPackageName := application,
    riffRaffBuildIdentifier := System.getProperty("build.number", "DEV").replaceAll("\"",""),
    riffRaffUploadArtifactBucket := System.getenv().getOrDefault("RIFF_RAFF_ARTIFACT_BUCKET", "aws-frontend-teamcity"),
    riffRaffUploadManifestBucket := System.getenv().getOrDefault("RIFF_RAFF_BUILD_BUCKET", "aws-frontend-teamcity"),
    riffRaffArtifactPublishPath := application,
    riffRaffManifestProjectName := s"dotcom:$application",
    artifactName := { (sv: ScalaVersion, module: ModuleID, artifact: Artifact) =>
      artifact.name + "." + artifact.extension
    }
  )

  def root() = Project("root", base = file(".")).enablePlugins(play.PlayScala)
    .settings(frontendCompilationSettings)

  def application(applicationName: String) = {
    Project(applicationName, file(applicationName)).enablePlugins(play.PlayScala, RiffRaffArtifact, UniversalPlugin)
    .settings(frontendDependencyManagementSettings)
    .settings(frontendCompilationSettings)
    .settings(frontendClientSideSettings)
    .settings(frontendTestSettings)
    .settings(VersionInfo.settings)
    .settings(libraryDependencies ++= Seq(commonsIo))
    .settings(frontendDistSettings(applicationName))
  }
}
