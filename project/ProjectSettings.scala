package com.gu

import com.gu.versioninfo.VersionInfo
import com.typesafe.sbt.packager.universal.UniversalPlugin
import sbt._
import sbt.Keys._
import com.gu.riffraff.artifact.RiffRaffArtifact
import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport._
import Dependencies._
import play.sbt.{PlayAkkaHttpServer, PlayNettyServer, PlayScala}
import com.typesafe.sbt.SbtNativePackager.Universal
import com.typesafe.sbt.packager.Keys.packageName

object ProjectSettings {

  val cleanAll = taskKey[Unit]("Cleans all projects in a build, regardless of dependencies")
  val checkScalastyle = taskKey[Unit]("check scalastyle compliance")

  val frontendCompilationSettings = Seq(
    organization := "com.gu",
    maxErrors := 20,
    javacOptions := Seq("-g","-encoding", "utf8"),
    scalacOptions := Seq("-unchecked", "-deprecation", "-target:jvm-1.8",
      "-Xcheckinit", "-encoding", "utf8", "-feature","-Xfatal-warnings"),
    publishArtifact in (Compile, packageDoc) := false,
    sources in (Compile,doc) := Seq.empty,
    doc in Compile := target.map(_ / "none").value,
    scalaVersion := "2.12.10",
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

  val frontendDependencyManagementSettings = Seq(
    ivyXML :=
      <dependencies>
        <exclude org="commons-logging" module="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
      </dependencies>,

    resolvers ++= Seq(
      Resolver.typesafeRepo("releases"),
      Resolver.sonatypeRepo("releases"),
      "Guardian Frontend Bintray" at "https://dl.bintray.com/guardian/frontend",
      "Guardian Editorial Tools Bintray" at "https://dl.bintray.com/guardian/editorial-tools",
      Resolver.bintrayRepo("guardian", "ophan"),
      "Spy" at "https://files.couchbase.com/maven2/",
      "emueller-bintray" at "http://dl.bintray.com/emueller/maven"
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

    checkScalastyle := org.scalastyle.sbt.ScalastylePlugin.autoImport.scalastyle.in(Test).toTask("").value,
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

  def root(): Project = Project("root", base = file("."))
    .enablePlugins(PlayScala, RiffRaffArtifact, PlayNettyServer)
    .disablePlugins(PlayAkkaHttpServer)
    .settings(frontendCompilationSettings)
    .settings(frontendRootSettings)

  def application(applicationName: String): Project = {
    Project(applicationName, file(applicationName))
      .enablePlugins(PlayScala, UniversalPlugin)
      .settings(frontendDependencyManagementSettings)
      .settings(frontendCompilationSettings)
      .settings(frontendTestSettings)
      .settings(VersionInfo.projectSettings)
      .settings(libraryDependencies ++= Seq(macwire, commonsIo))
      .settings(packageName in Universal := applicationName)
  }

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
    testAssets.filterNot { case (_, fileName) =>
      // built in sbt plugins did not like the bower files
      fileName.endsWith("bower.json")
    }

  def withTests(project: Project): ClasspathDep[ProjectReference] = project % "test->test;compile->compile"
}
