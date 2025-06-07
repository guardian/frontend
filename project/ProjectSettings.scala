package com.gu

import com.gu.versioninfo.VersionInfo
import com.typesafe.sbt.packager.universal.UniversalPlugin
import sbt.*
import sbt.Keys.*
import com.gu.Dependencies.*
import play.sbt.{PlayNettyServer, PlayPekkoHttpServer, PlayScala}
import com.typesafe.sbt.SbtNativePackager.Universal
import com.typesafe.sbt.packager.Keys.packageName
import sbt.internal.util.ManagedLogger
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
    scalaVersion := "2.13.16",
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
    resolvers ++= Resolver.sonatypeOssRepos("releases"),
    update / evictionWarningOptions := EvictionWarningOptions.default
      .withWarnTransitiveEvictions(false)
      .withWarnDirectEvictions(false)
      .withWarnScalaVersionEviction(false),
  )

  val testStage = {
    // 'CI' is a default variable in GitHub Runners - https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
    if (sys.env.get("CI").contains("true")) {
      println(s"Tests are running in CI")
      "DEVINFRA"
    } else "LOCALTEST"
  }

  val frontendTestSettings = Seq(
    Test / testOptions += Tests.Argument(TestFrameworks.ScalaTest, "-u", s"test-results/scala-${scalaVersion.value}", "-o"),
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
    Test / javaOptions += "-XX:ReservedCodeCacheSize=128m",
    Test / baseDirectory := file("."),
    Test / envVars := Map("STAGE" -> testStage),
    // Set testResultLogger back to the default, fixes an issue with `sbt-teamcity-logger`
    //   See: https://github.com/JetBrains/sbt-tc-logger/issues/9
    Test / test / testResultLogger := TestResultLogger.Default,
  )

  val testAll = taskKey[Unit]("test all aggregate projects")
  val testGroup1 = taskKey[Unit]("test all aggregate projects")

  private def getTestsByGroup(
                               tests: collection.Seq[TestDefinition],
                               groupSize: Int,
                               group: Int,
                               log: ManagedLogger,
                             ): collection.Seq[TestDefinition] = {
    // split the tests into groups of size groupSize and return the requested group
    val segmentSize = (tests.size + groupSize - 1) / groupSize // ceiling division
    log.info(s"Segment size: $segmentSize, Total tests: ${tests.size}, Group: $group")
    val segment = tests.grouped(segmentSize).toSeq.lift(group - 1).getOrElse(Seq.empty)
    segment.map { test =>
      new TestDefinition(
        test.name,
        test.fingerprint,
        test.explicitlySpecified,
        test.selectors,
      )
    }
  }

  private def logTests(
                        log: ManagedLogger,
                        tests: Seq[TestDefinition],
                        filteredTests: Seq[TestDefinition],
                        groupSize: Int,
                        group: Int,
                      ): Unit = {
    val GREEN = "\u001B[92m"
    val RESET = "\u001B[0m"
    log.info(s"=====================================")
    log.info(s"Test grouping")
    log.info(s"=====================================")
    log.info(s"All tests      : ${tests.size}")
    log.info(s"Group          : $group / $groupSize")
    log.info(s"Tests in group : ${filteredTests.size}")
    log.info(s"========")
    log.info(s"Tests (${tests.size})")
    log.info(s"Tests in group (${filteredTests.size}) denoted by *")
    log.info(
      tests.zipWithIndex
        .map { case (t, i) =>
          val isInGroup = filteredTests.exists(_.name == t.name)
          val prefix = if (isInGroup) s"$GREEN* " else s"  "
          val numberWithPadding = s"${i + 1}.".padTo(5, ' ')
          s"$prefix$numberWithPadding${t.name}$RESET"
        }
        .mkString("\n"),
    )
    log.info(s"=====================================")
  }

  private def createTestGroupTask(groupSize: Int, group: Int) = Def.taskDyn {
    val tests = (Test / definedTests).all(ScopeFilter(inAggregates(ThisProject, includeRoot = false))).value.flatten.sortBy(_.name)
    val log = streams.value.log
    log.info(s"Total tests: ${tests.size}, Group size: $groupSize, Group: $group")
    val filteredTests = getTestsByGroup(tests, groupSize, group, log)
    log.info(s"Filtered tests: ${filteredTests.size}")
    logTests(log, tests, filteredTests, groupSize, group)
    if (filteredTests.isEmpty) {
      log.warn("No filtered tests found")
      Def.task(())
    } else {
      val testArgs = " " + filteredTests.map(_.name).mkString(" ")
      log.info(s"Running tests:$testArgs")
        //      (Test / testOnly).toTask(" common.Assets.AssetsTest common.BoxSpec")
      (ThisProject / Test / testOnly).toTask(testArgs)
    }
  }

  def frontendRootSettings: Seq[Def.Setting[Task[Unit]]] =
    List(
      testAll := (Test / test)
        .all(ScopeFilter(inAggregates(ThisProject, includeRoot = false)))
        .value,
      testGroup1 := createTestGroupTask(20, 2).value
    )

  def root(): Project =
    Project("root", base = file("."))
      .settings(Test / aggregate := true, Test / testOnly / aggregate := true)
      .settings(frontendRootSettings)
//      .settings(testGroup1 := createTestGroupTask(20, 2).value)

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
      .disablePlugins(PlayPekkoHttpServer)
      .settings(frontendDependencyManagementSettings)
      .settings(frontendCompilationSettings)
      .settings(frontendTestSettings)
      .settings(VersionInfo.projectSettings)
      .settings(libraryDependencies ++= Seq(commonsIo))
  }

  def filterAssets(testAssets: Seq[(File, String)]): Seq[(File, String)] =
    testAssets.filterNot { case (_, fileName) =>
      // built in sbt plugins did not like the bower files
      fileName.endsWith("bower.json") || fileName.contains("TestAppLoader")
    }

  def withTests(project: Project): ClasspathDep[ProjectReference] =
    project % "test->test;compile->compile"
}
