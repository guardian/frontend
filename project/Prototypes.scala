import sbt._
import sbt.Keys._
import sbt.PlayProject._

import com.gu.deploy.PlayArtifact._
import com.gu.deploy.PlayAssetHash._
import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy
import com.typesafe.sbtscalariform.ScalariformPlugin._
import com.gu.SbtJshintPlugin._


trait Prototypes extends Testing {
  val version: String

  def root() = Project("root", base = file("."))
    .settings(org.sbtidea.SbtIdeaPlugin.ideaSettings: _*)
    .settings(
      parallelExecution in Global := false
    )

  def base(name: String) = PlayProject(name, version, path = file(name), mainLang = SCALA)
    .settings(jshintSettings: _*)
    .settings(scalariformSettings: _*)
    .settings(playAssetHashDistSettings: _*)
    .settings(
      scalaVersion := "2.9.1",

      maxErrors := 20,
      javacOptions := Seq("-g", "-source", "1.6", "-target", "1.6", "-encoding", "utf8"),
      scalacOptions := Seq("-unchecked", "-optimise", "-deprecation", "-Xcheckinit", "-encoding", "utf8"),

      ivyXML :=
        <dependencies>
          <exclude org="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
          <exclude org="org.springframework"><!-- Because I don't like it. --></exclude>
        </dependencies>,

      organization := "com.gu",

      resolvers := Seq(
        "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
        Resolver.url("Typesafe Ivy Releases", url("http://repo.typesafe.com/typesafe/ivy-releases"))(Resolver.ivyStylePatterns),
        "JBoss Releases" at "http://repository.jboss.org/nexus/content/repositories/releases",
        "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
        "Akka" at "http://repo.akka.io/releases"
      ),

      libraryDependencies ++= Seq(
        "org.scalatest" %% "scalatest" % "1.8" % "test"
      ),

      // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
      testOptions in Test := Nil,

      // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
      unmanagedClasspath in Test <+= (baseDirectory) map { bd => Attributed.blank(bd / "test") },

      jshintFiles <+= baseDirectory { base =>
        (base / "app" / "assets" / "javascripts" ** "*.js") --- (base / "app" / "assets" / "javascripts" / "components" ** "*.js")
      },

      jshintOptions <+= (baseDirectory) { base =>
        (base.getParentFile / "resources" / "jshint_conf.json")
      },

      (test in Test) <<= (test in Test) dependsOn (jshint),

      //effectively disables built in Play javascript compiler
      javascriptEntryPoints <<= (sourceDirectory in Compile) { base => (base / "assets" ** "*.none") },
      
      assetsToHash <<= (sourceDirectory in Compile) { sourceDirectory =>
        Seq(
          // don't copy across svg files (they're inline)
          (sourceDirectory / "assets" / "images") ** "*.png",
          (sourceDirectory / "assets" / "javascripts" / "bootstraps") ** "app.js",
          (sourceDirectory / "public") ** "*"
        )
      },

      staticFilesPackage := "frontend-static",

      templatesImport ++= Seq(
        "common._",
        "model._",
        "views._",
        "views.support._",
        "conf._"
      )
    )

  def library(name: String) = base(name).settings(
    libraryDependencies ++= Seq(
      "com.gu" % "management-play_2.9.1" % "5.13",
      "com.gu" % "management-logback_2.9.1" % "5.13",
      "com.gu" % "configuration_2.9.1" % "3.6",
      "com.gu.openplatform" % "content-api-client_2.9.1" % "1.17",

      "com.typesafe.akka" % "akka-agent" % "2.0.2",
      "commons-io" % "commons-io" % "2.4",
      "org.scala-tools.time" % "time_2.9.1" % "0.5",
      "com.googlecode.htmlcompressor" % "htmlcompressor" % "1.4",
      "com.yahoo.platform.yui" % "yuicompressor" % "2.4.6",

      "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6",
      "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6",
      "org.jsoup" % "jsoup" % "1.6.3",
      "org.jboss.dna" % "dna-common" % "0.6"
    )
  )

  def application(name: String) = base(name).settings(
    features <<= featuresTask,

    executableName := "frontend-%s" format name,
    jarName in assembly <<= (executableName) { "%s.jar" format _ },

    mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
      {
        case s: String if s.startsWith("org/mozilla/javascript/") => MergeStrategy.first
        case s: String if s.startsWith("jargs/gnu/") => MergeStrategy.first
        case "README" => MergeStrategy.first
        case "CHANGELOG" => MergeStrategy.first
        case x => old(x)
      }
    }
  )
}
