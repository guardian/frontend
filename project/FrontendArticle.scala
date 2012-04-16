import collection.Seq
import com.google.common.io.Files

import java.io.File
import java.security.MessageDigest
import sbt._
import Keys._
import PlayProject._
import sbtassembly.Plugin._
import AssemblyKeys._
import frontend.Frontend._

object FrontendArticle extends Build {

  private val appName = "frontend-article"
  private val appVersion = "1-SNAPSHOT"

  private val staticPathsFile = SettingKey[File]("static-paths-file",
    "The location of the file that static paths are generated in")

  private val appDependencies = Seq(
    //dependencies included in distribution
    "com.gu.openplatform" %% "content-api-client" % "1.13",
    "com.gu" %% "configuration" % "3.6",
    "com.gu" %% "management-play" % "5.7",
    "com.gu" %% "management-logback" % "5.7",

    "com.gu" %% "frontend-common" % "1.3",

    //dependencies in test only
    "org.scalatest" %% "scalatest" % "1.7.1" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)
    .settings(frontendSettings: _*)
    .settings(
	    resolvers += "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
	    // Disable Specs options to use ScalaTest
	    testOptions in Test := Nil,
	    organization := "com.gu",
	    scalaVersion := "2.9.1",
	    maxErrors := 20,
	    javacOptions ++= Seq("-source", "1.6", "-target", "1.6", "-encoding", "utf8"),
	    scalacOptions ++= Seq("-unchecked", "-optimise", "-deprecation", "-Xcheckinit", "-encoding", "utf8"),
	    jarName in assembly := "%s.jar" format appName,
	    templatesImport ++= Seq(
	      "content.Article",
	      "frontend.common._"
	    ),
	    excludedFiles in assembly := {
	      (base: Seq[File]) =>
	      //todo
	        ((base / "logger.xml") +++ (base / "META-INF" / "MANIFEST.MF")).get
	    },
	    staticPathsFile in Compile <<= (resourceManaged in Compile) / "static-paths.properties"
  )
}
