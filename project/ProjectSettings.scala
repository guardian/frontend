package com.gu

import com.gu.versioninfo.VersionInfo
import com.typesafe.sbt.packager.universal.UniversalPlugin
import sbt._
import sbt.Keys._
import com.gu.Dependencies._
import play.sbt.{PlayAkkaHttpServer, PlayNettyServer, PlayScala}
import com.typesafe.sbt.SbtNativePackager.Universal
import com.typesafe.sbt.packager.Keys.packageName
import sbtbuildinfo.{BuildInfoKey, BuildInfoOption, BuildInfoPlugin}
import sbtbuildinfo.BuildInfoKeys.{buildInfoKeys, buildInfoOptions, buildInfoPackage}

object ProjectSettings {

  val cleanAll = taskKey[Unit]("Cleans all projects in a build, regardless of dependencies")

  val frontendCompilationSettings = Seq(
    organization := "com.gu",
    maxErrors := 20,
    javacOptions := Seq("-g", "-encoding", "utf8"),
    scalacOptions ++= Seq(
      "-unchecked",
      "-deprecation",
      "-release:11",
      "-Xcheckinit",
      "-encoding",
      "utf8",
      "-feature",
      "-Xfatal-warnings",
    ),
    Compile / packageDoc / publishArtifact := false,
    Compile / doc / sources := Seq.empty,
    Compile / doc := target.map(_ / "none").value,
    scalaVersion := "2.13.10",
    initialize := {
      val _ = initialize.value
      assert(
        sys.props("java.specification.version") == "11",
        "Java 11 is required for this project.",
      )
    },
    cleanAll := Def.taskDyn {
      val allProjects = ScopeFilter(inAnyProject)
      clean.all(allProjects)
    }.value,
  )

  val frontendDependencyManagementSettings = Seq(
    ivyXML :=
      <dependencies>
        <exclude org="commons-logging" module="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
      </dependencies>,
    resolvers ++= Resolver.sonatypeOssRepos("releases") ++ Seq(
      Resolver.typesafeRepo("releases"),
      "Spy" at "https://files.couchbase.com/maven2/",
    ),
    update / evictionWarningOptions := EvictionWarningOptions.default
      .withWarnTransitiveEvictions(false)
      .withWarnDirectEvictions(false)
      .withWarnScalaVersionEviction(false),
  )

  val frontendTestSettings = Seq(
    // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
    Test / testOptions := Nil,
    concurrentRestrictions in Global := List(Tags.limit(Tags.Test, 4)),
    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    Test / unmanagedClasspath += (baseDirectory map { bd => Attributed.blank(bd / "test") }).value,
    libraryDependencies ++= Seq(
      scalaTest,
      scalaTestPlus,
      scalaTestPlusMockito,
      scalaTestPlusScalacheck,
      mockito,
    ),
    // These settings are needed for forking, which in turn is needed for concurrent restrictions.
    Test / javaOptions += "-DAPP_SECRET=this_is_not_a_real_secret_just_for_tests",
    Test / javaOptions += "-Xmx2048M",
    Test / javaOptions += "-XX:+UseConcMarkSweepGC",
    Test / javaOptions += "-XX:ReservedCodeCacheSize=128m",
    Test / baseDirectory := file("."),
    Test / envVars := Map("STAGE" -> "DEVINFRA"),
    // Set testResultLogger back to the default, fixes an issue with `sbt-teamcity-logger`
    //   See: https://github.com/JetBrains/sbt-tc-logger/issues/9
    Test / test / testResultLogger := TestResultLogger.Default,
  )

  val testAll = taskKey[Unit]("test all aggregate projects")

  def frontendRootSettings: Seq[Def.Setting[Task[Unit]]] =
    List(
      testAll := (Test / test)
        .all(ScopeFilter(inAggregates(ThisProject, includeRoot = false)))
        .value,
    )

  def root(): Project =
    Project("root", base = file("."))
      .enablePlugins(PlayScala, PlayNettyServer)
      .disablePlugins(PlayAkkaHttpServer)
      .settings(frontendCompilationSettings)
      .settings(frontendRootSettings)

  def application(applicationName: String): Project = {
    Project(applicationName, file(applicationName))
      .enablePlugins(PlayScala, UniversalPlugin, BuildInfoPlugin)
      .settings(frontendDependencyManagementSettings)
      .settings(frontendCompilationSettings)
      .settings(frontendTestSettings)
      .settings(VersionInfo.projectSettings)
      .settings(libraryDependencies ++= Seq(macwire, commonsIo))
      .settings(Universal / packageName := applicationName)
      .settings(buildInfoSettings(s"frontend.${applicationName.replaceAll("-", "")}"))
  }

  def buildInfoSettings(buildInfoPackageName: String): Seq[Def.Setting[_]] =
    Seq(
      buildInfoPackage := buildInfoPackageName,
      buildInfoOptions += BuildInfoOption.Traits("app.FrontendBuildInfo"),
      buildInfoKeys := {
        Seq[BuildInfoKey](
          "buildNumber" -> sys.env.get("GITHUB_RUN_NUMBER").getOrElse("unknown"),
          "gitCommitId" -> sys.env.get("GITHUB_SHA").getOrElse("unknown"),
          "buildTime" -> System.currentTimeMillis,
        )
      },
    )

  def library(applicationName: String): Project = {
    Project(applicationName, file(applicationName))
      .enablePlugins(PlayScala, PlayNettyServer)
      .disablePlugins(PlayAkkaHttpServer)
      .settings(frontendDependencyManagementSettings)
      .settings(frontendCompilationSettings)
      .settings(frontendTestSettings)
      .settings(VersionInfo.projectSettings)
      .settings(libraryDependencies ++= Seq(commonsIo))
  }

  def filterAssets(testAssets: Seq[(File, String)]): Seq[(File, String)] =
    testAssets.filterNot {
      case (_, fileName) =>
        // built in sbt plugins did not like the bower files
        fileName.endsWith("bower.json")
    }

  def withTests(project: Project): ClasspathDep[ProjectReference] =
    project % "test->test;compile->compile"
}
