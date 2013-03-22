import com.gu.versioninfo.VersionInfo
import sbt._
import sbt.Keys._
import sbt.PlayProject._

import PlayArtifact._
import PlayAssetHash._
import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy

trait Prototypes extends Testing {
  val version: String

  def root() = Project("root", base = file("."))
    //.settings(org.sbtidea.SbtIdeaPlugin.ideaSettings: _*)
    .settings(
      scalaVersion := "2.10.0", //TODO why does root not get auto 2.10.0?
      parallelExecution in ThisBuild := false
    )

  def base(name: String) =   play.Project(name, version, path = file(name))
    .settings(playAssetHashDistSettings: _*)
    .settings(
      maxErrors := 20,
      javacOptions := Seq("-g", "-source", "1.6", "-target", "1.6", "-encoding", "utf8"),
      scalacOptions := Seq("-unchecked", "-optimise", "-deprecation",
        "-Xcheckinit", "-encoding", "utf8", "-feature", "-Yinline-warnings", "Xfatal-warnings"),

      ivyXML :=
        <dependencies>
          <exclude org="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
          <exclude org="org.springframework"><!-- Because I don't like it. --></exclude>
          <exclude org="org.specs2"><!-- because someone thinks it is acceptable to have this as a prod dependency --></exclude>
        </dependencies>,

      organization := "com.gu",

      resolvers := Seq(
        "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
        Resolver.url("Typesafe Ivy Releases", url("http://repo.typesafe.com/typesafe/ivy-releases"))(Resolver.ivyStylePatterns),
        "JBoss Releases" at "http://repository.jboss.org/nexus/content/repositories/releases",
        "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
        "Akka" at "http://repo.akka.io/releases"
      ),

      // No released version of Salat for 2.10.0
      resolvers += "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots",

      libraryDependencies ++= Seq(
        "org.scalatest" %% "scalatest" % "1.9.1" % "test"
      ),

      // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
      testOptions in Test := Nil,

      // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
      unmanagedClasspath in Test <+= (baseDirectory) map { bd => Attributed.blank(bd / "test") },

      //effectively disables built in Play javascript compiler
      javascriptEntryPoints <<= (sourceDirectory in Compile) { base => (base / "assets" ** "*.none") },
      lessEntryPoints <<= (sourceDirectory in Compile) { base => (base / "assets" ** "*.none") },
      
      assetsToHash <<= (sourceDirectory in Compile) { sourceDirectory =>
        Seq(
          // don't copy across svg files (they're inline)
          (sourceDirectory / "assets" / "images") ** "*.png",
          (sourceDirectory / "assets" / "javascripts" / "bootstraps") ** "app.js",
          (sourceDirectory / "assets" / "stylesheets") ** "main.min.css",
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

  def library(name: String) = base(name).settings(
    libraryDependencies ++= Seq(
        "com.gu" %% "management-play" % "5.26",
      "com.gu" %% "configuration" % "3.9",
      "com.gu.openplatform" %% "content-api-client" % "1.22",

      "com.typesafe.akka" %% "akka-agent" % "2.1.0",
      "commons-io" % "commons-io" % "2.4",
      "org.scalaj" % "scalaj-time_2.10.0-M7" % "0.6",
      "com.googlecode.htmlcompressor" % "htmlcompressor" % "1.4",
      "com.yahoo.platform.yui" % "yuicompressor" % "2.4.6",

      "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6",
      "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6",
      "org.jsoup" % "jsoup" % "1.6.3",
      "org.jboss.dna" % "dna-common" % "0.6"
    )
  )

  def application(name: String) = base(name)
    .settings(VersionInfo.settings:_*)
    .settings(
    test in assembly := {},
    executableName := "frontend-%s" format name,
    jarName in assembly <<= (executableName) { "%s.jar" format _ },

    mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
      {
        case s: String if s.startsWith("org/mozilla/javascript/") => MergeStrategy.first
        case s: String if s.startsWith("jargs/gnu/") => MergeStrategy.first
        case s: String if s.startsWith("scala/concurrent/stm") => MergeStrategy.first
        case s: String if s.endsWith("ServerWithStop.class") => MergeStrategy.first  // There is a scala trait and a Java interface
        case "README" => MergeStrategy.first
        case "CHANGELOG" => MergeStrategy.first
        case x => println(x)
          old(x)
      }
    }
  )
}
