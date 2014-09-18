package com.gu

import com.gu.versioninfo.VersionInfo
import sbt._
import sbt.Keys._
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.typesafe.sbt.SbtNativePackager._
import play.twirl.sbt.Import._
import Dependencies._

trait Prototypes {
  val version = "1-SNAPSHOT"

  val frontendCompilationSettings = Seq(
    organization := "com.gu",

    maxErrors := 20,
    javacOptions := Seq(
      "-g",
      "-encoding", "utf8"
    ),
    scalacOptions := Seq("-unchecked", "-optimise", "-deprecation",
      "-Xcheckinit", "-encoding", "utf8", "-feature", "-Yinline-warnings",
      "-Xfatal-warnings"
    ),
    doc in Compile <<= target.map(_ / "none")
  )

  val frontendDependencyManagementSettings = Seq(
    ivyXML :=
      <dependencies>
        <exclude org="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
        <exclude org="org.springframework"><!-- Because I don't like it. --></exclude>
        <exclude org="org.specs2"><!-- because someone thinks it is acceptable to have this as a prod dependency --></exclude>
      </dependencies>,

    resolvers := Seq(
      Resolver.typesafeRepo("releases"),
      Classpaths.typesafeReleases,
      "Akka" at "http://repo.akka.io/releases",
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
      "Guardian Github Snapshots" at "http://guardian.github.com/maven/repo-snapshots",
      "JBoss Releases" at "https://repository.jboss.org/nexus/content/repositories/releases"
    ),

    resolvers ++= Seq(
      // where Shade lives
      "BionicSpirit Releases" at "http://maven.bionicspirit.com/releases/",
      // for SpyMemcached
      "Spy" at "https://files.couchbase.com/maven2/"
    )
  )

  val frontendClientSideSettings = Seq(
    sourceDirectory in Assets := (sourceDirectory in Compile).value / "assets.none",
    sourceDirectory in TestAssets := (sourceDirectory in Test).value / "assets.none",

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

    // Dev experiments suggested 4 concurrent test tasks gave the best results, at the time.
    concurrentRestrictions in Global += Tags.limit(Tags.Test, 4),

    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    unmanagedClasspath in Test <+= (baseDirectory) map { bd => Attributed.blank(bd / "test") },

    libraryDependencies ++= Seq(
      scalaTest,
      mockito
    ),

    // These settings are needed for forking, which in turn is needed for concurrent restrictions.
    javaOptions in Test += "-DAPP_SECRET=this_is_not_a_real_secret_just_for_tests",
    javaOptions in Test += "-XX:MaxPermSize=680m",
    baseDirectory in Test := file(".")
  )

  def root() = Project("root", base = file(".")).enablePlugins(play.PlayScala)

  def application(applicationName: String) = {
    Project(applicationName, file(applicationName)).enablePlugins(play.PlayScala)
    .settings(frontendDependencyManagementSettings:_*)
    .settings(frontendCompilationSettings:_*)
    .settings(frontendClientSideSettings:_*)
    .settings(frontendTestSettings:_*)
    .settings(VersionInfo.settings:_*)
    .settings(
      libraryDependencies ++= Seq(
        commonsIo
      )
    )
    .settings(name in Universal := applicationName)
  }
}
