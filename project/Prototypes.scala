package com.gu

import com.gu.versioninfo.VersionInfo
import com.typesafe.sbt.packager.universal.UniversalPlugin
import sbt._
import sbt.Keys._
import com.gu.riffraff.artifact.RiffRaffArtifact
import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport._
import Dependencies._
import play.sbt.PlayScala
import com.typesafe.sbt.SbtNativePackager.Universal
import com.typesafe.sbt.packager.Keys.packageName

trait Prototypes {
  val version = "1-SNAPSHOT"

  val cleanAll = taskKey[Unit]("Cleans all projects in a build, regardless of dependencies")
  val checkScalastyle = taskKey[Unit]("check scalastyle compliance")

  val frontendCompilationSettings = Seq(
    organization := "com.gu",
    maxErrors := 20,
    javacOptions := Seq("-g","-encoding", "utf8"),
    scalacOptions := Seq("-unchecked", "-deprecation", "-target:jvm-1.8",
      "-Xcheckinit", "-encoding", "utf8", "-feature", "-Yinline-warnings","-Xfatal-warnings"),
    publishArtifact in (Compile, packageDoc) := false,
    sources in (Compile,doc) := Seq.empty,
    doc in Compile := target.map(_ / "none").value,
    incOptions := incOptions.value.withNameHashing(true),
    scalaVersion := "2.11.11",
    initialize := {
      val _ = initialize.value
      assert(sys.props("java.specification.version") == "1.8",
        "Java 8 is required for this project.")
    },
    cleanAll := Def.taskDyn {
      val allProjects = ScopeFilter(inAnyProject)
      clean.all(allProjects)
    }.value
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
        <exclude org="org.specs2"><!-- because someone thinks it is acceptable to have this as a prod dependency --></exclude>
      </dependencies>,

    resolvers ++= Seq(
      Resolver.typesafeRepo("releases"),
      Resolver.sonatypeRepo("releases"),
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
      "Guardian Frontend Bintray" at "https://dl.bintray.com/guardian/frontend",
      "Guardian Editorial Tools Bintray" at "https://dl.bintray.com/guardian/editorial-tools",
      "Spy" at "https://files.couchbase.com/maven2/"
    ),

    evictionWarningOptions in update := EvictionWarningOptions.default
      .withWarnTransitiveEvictions(false)
      .withWarnDirectEvictions(false)
      .withWarnScalaVersionEviction(false)
  )

  val frontendTestSettings = Seq(
    // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
    testOptions in Test := Nil,
    concurrentRestrictions in Global := List(Tags.limit(Tags.Test, 4)),

    checkScalastyle := org.scalastyle.sbt.ScalastylePlugin.scalastyle.in(Test).toTask("").value,
    (test in Test) := (test in Test).dependsOn(checkScalastyle).value,

    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    unmanagedClasspath in Test += (baseDirectory map { bd => Attributed.blank(bd / "test") }).value,

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
  val upload = taskKey[Unit]("upload riff-raff artifact from root project")
  val testThenUpload = taskKey[Unit]("Conditional task that uploads to riff raff only if tests pass")

  def frontendRootSettings: Seq[Def.Setting[Task[Unit]]] = List(
    testAll := (test in Test).all(ScopeFilter(inAggregates(ThisProject, includeRoot = false))).value,
    upload := riffRaffUpload.in(LocalRootProject).value,

    testThenUpload := Def.taskDyn({
     testAll.result.value match {
       case Inc(inc) => Def.task[Unit] {
         println("Tests failed, no riff raff upload will be performed.")
         throw inc
       }
       case Value(_) =>
         println("Tests passed, uploading artifact to riff raff.")
         upload.toTask
     }
    }).value
  )

  def root(): Project = Project("root", base = file(".")).enablePlugins(PlayScala, RiffRaffArtifact)
    .settings(frontendCompilationSettings)
    .settings(frontendRootSettings)

  def application(applicationName: String): Project = {
    Project(applicationName, file(applicationName)).enablePlugins(PlayScala, UniversalPlugin)
    .settings(frontendDependencyManagementSettings)
    .settings(frontendCompilationSettings)
    .settings(frontendTestSettings)
    .settings(VersionInfo.settings)
    .settings(libraryDependencies ++= Seq(macwire, commonsIo))
    .settings(packageName in Universal := applicationName)
    .settingSets(settingSetsOrder)
    .settings(
      mappings in Universal ++= (file("ui/dist") ** "*").get.map { f => f.getAbsoluteFile -> f.toString }
    )
  }

  def library(applicationName: String): Project = {
    Project(applicationName, file(applicationName)).enablePlugins(PlayScala)
    .settings(frontendDependencyManagementSettings)
    .settings(frontendCompilationSettings)
    .settings(frontendTestSettings)
    .settings(VersionInfo.settings)
    .settings(libraryDependencies ++= Seq(commonsIo))
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
