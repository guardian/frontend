package com.gu

import com.gu.versioninfo.VersionInfo
import sbt._
import sbt.Keys._
import play.Project._
import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin._

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
      "-Xfatal-warnings")
  )

  val frontendDependencyManagementSettings = Seq(
    ivyXML :=
      <dependencies>
        <exclude org="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
        <exclude org="org.springframework"><!-- Because I don't like it. --></exclude>
        <exclude org="org.specs2"><!-- because someone thinks it is acceptable to have this as a prod dependency --></exclude>
      </dependencies>,

    resolvers := Seq(
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
      Resolver.url("Typesafe Ivy Releases", url("http://repo.typesafe.com/typesafe/ivy-releases"))(Resolver.ivyStylePatterns),
      "JBoss Releases" at "http://repository.jboss.org/nexus/content/repositories/releases",
      "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
      "Akka" at "http://repo.akka.io/releases"
    ),

    resolvers ++= Seq(
      // where Shade lives
      "BionicSpirit Releases" at "http://maven.bionicspirit.com/releases/",
      // for SpyMemcached
      "Spy" at "http://files.couchbase.com/maven2/"
    )
  )

  val frontendClientSideSettings = Seq(
    // Effectively disable built in Play javascript compiler
    javascriptEntryPoints <<= (sourceDirectory in Compile) { base => (base / "assets" ** "*.none") },
    lessEntryPoints <<= (sourceDirectory in Compile) { base => (base / "assets" ** "*.none") },

    templatesImport ++= Seq(
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

    // APP_SECRET system property not passed to forked?
    sbt.Keys.fork in Test := false,

    concurrentRestrictions in Global := Seq(Tags.limitAll(1)),

    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    unmanagedClasspath in Test <+= (baseDirectory) map { bd => Attributed.blank(bd / "test") },

    libraryDependencies ++= Seq(
      "org.scalatest" %% "scalatest" % "2.0.RC1" % "test",
      "org.mockito" % "mockito-all" % "1.9.5" % "test"
    ),

    (javaOptions in test) += "-DAPP_SECRET=secret"
  )

  val frontendAssemblySettings = assemblySettings ++ Seq(
    test in assembly := {},
    jarName in assembly <<= (name) map { "frontend-%s.jar" format _ },
    aggregate in assembly := false,
    mainClass in assembly := Some("play.core.server.NettyServer"),

    mergeStrategy in assembly <<= (mergeStrategy in assembly) { current =>
      {
        case s: String if s.startsWith("org/mozilla/javascript/") => MergeStrategy.first
        case s: String if s.startsWith("org/jdom/") || s.startsWith("JDOM") => MergeStrategy.last
        case s: String if s.startsWith("jargs/gnu/") => MergeStrategy.first
        case s: String if s.startsWith("scala/concurrent/stm") => MergeStrategy.first
        case s: String if s.endsWith("ServerWithStop.class") => MergeStrategy.first  // There is a scala trait and a Java interface

        // transitive dependencies of DFP API
        case "com/google/common/annotations/Beta.class" => MergeStrategy.first
        case s: String if s.startsWith("com/google/common/") => MergeStrategy.first
        case s: String if s.startsWith("org/apache/commons/collections/") => MergeStrategy.first

        // Take ours, i.e. MergeStrategy.last...
        case "logger.xml" => MergeStrategy.last
        case "version.txt" => MergeStrategy.last

        // Merge play.plugins because we need them all
        case "play.plugins" => MergeStrategy.filterDistinctLines

        // Try to be helpful...
        case "overview.html" => MergeStrategy.discard
        case "NOTICE" => MergeStrategy.discard
        case "README" => MergeStrategy.discard
        case "CHANGELOG" => MergeStrategy.discard
        case meta if meta.startsWith("META-INF/") => MergeStrategy.discard

        case other => current(other)
      }
    }
  )

  def root() = Project("root", base = file("."))

  def application(name: String) = play.Project(name, version, path = file(name))
    .settings(frontendDependencyManagementSettings:_*)
    .settings(frontendCompilationSettings:_*)
    .settings(frontendClientSideSettings:_*)
    .settings(frontendTestSettings:_*)
    .settings(VersionInfo.settings:_*)
    .settings(frontendAssemblySettings:_*)
    .settings(
      libraryDependencies ++= Seq(
        "com.gu" %% "management-play" % "6.1",
        "commons-io" % "commons-io" % "2.4"
      )
    )
}
