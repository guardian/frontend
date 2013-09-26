import com.gu.versioninfo.VersionInfo
import sbt._
import sbt.Keys._
import play.Project._
import PlayArtifact._
import PlayAssetHash._
import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy
import SbtGruntPlugin._

trait Prototypes {
  val version = "1-SNAPSHOT"

  val frontendCompilationSettings = Seq(
    organization := "com.gu",

    maxErrors := 20,
    javacOptions := Seq(
      "-g",
      "-source", "1.6",
      "-target", "1.6",
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
    )
  )

  val frontendClientSideSettings = Seq(
    // Effectively disable built in Play javascript compiler
    javascriptEntryPoints <<= (sourceDirectory in Compile) { base => (base / "assets" ** "*.none") },
    lessEntryPoints <<= (sourceDirectory in Compile) { base => (base / "assets" ** "*.none") },

    assetsToHash <<= (sourceDirectory in Compile) { sourceDirectory =>
      Seq(
        // don't copy across svg files (they're inline)
        (sourceDirectory / "assets" / "images") ** "*.png",
        (sourceDirectory / "assets" / "javascripts" / "bootstraps") ** "app.js",
        (sourceDirectory / "assets" / "stylesheets") ** "*.min.css",
        (sourceDirectory / "public") ** "*"
      )
    },

    staticFilesPackage := "frontend-static",

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
    sbt.Keys.fork in Test := false,

    // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
    unmanagedClasspath in Test <+= (baseDirectory) map { bd => Attributed.blank(bd / "test") },

    libraryDependencies ++= Seq(
      "org.scalatest" %% "scalatest" % "1.9.1" % "test"
    ),

    (javaOptions in test) += "-DAPP_SECRET=secret"
  )

  val frontendAssemblySettings = Seq(
    test in assembly := {},
    executableName <<= (name) { "frontend-%s" format _ },
    jarName in assembly <<= (executableName) map { "%s.jar" format _ },
    aggregate in assembly := false,
    aggregate in dist := false,

    mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
      {
        case s: String if s.startsWith("org/mozilla/javascript/") => MergeStrategy.first
        case s: String if s.startsWith("jargs/gnu/") => MergeStrategy.first
        case s: String if s.startsWith("scala/concurrent/stm") => MergeStrategy.first
        case s: String if s.endsWith("ServerWithStop.class") => MergeStrategy.first  // There is a scala trait and a Java interface

        case "README" => MergeStrategy.discard
        case "CHANGELOG" => MergeStrategy.discard

        case x => old(x)
      }
    }
  )

  val javascriptFiles = SettingKey[PathFinder]("javascript-files", "All javascript")
  val cssFiles = SettingKey[PathFinder]("css-files", "All css")

  val frontendGruntSettings = Seq(
    javascriptFiles <<= baseDirectory{ (baseDir) => baseDir \ "app" \ "assets" ** "*.js" },
    cssFiles <<= baseDirectory{ (baseDir) => baseDir \ "app" \ "assets" ** "*.scss" },

    (test in Test) <<= (test in Test) dependsOn (gruntTask("jshint:common")),

    resources in Compile <<= (resources in Compile) dependsOn (gruntTask("compile:common:js", javascriptFiles)),
    resources in Compile <<= (resources in Compile) dependsOn (gruntTask("compile:common:css", cssFiles))
  )

  def root() = Project("root", base = file("."))
    .settings(
      scalaVersion := "2.10.0", //TODO why does root not get auto 2.10.0?
      parallelExecution in ThisBuild := false
    )

  def base(name: String) = play.Project(name, version, path = file(name))
    .settings(VersionInfo.settings:_*)
    .settings(frontendCompilationSettings:_*)
    .settings(frontendTestSettings:_*)

  def application(name: String) = base(name)
    .settings(playAssetHashDistSettings: _*)
    .settings(frontendClientSideSettings:_*)
    .settings(frontendDependencyManagementSettings:_*)
    .settings(frontendAssemblySettings:_*)
    .settings(libraryDependencies ++= Seq(
      "com.gu" %% "management-play" % "5.27",
      "commons-io" % "commons-io" % "2.4"
    ))

  def grunt(name: String) = application(name)
    .settings(frontendGruntSettings:_*)
}
