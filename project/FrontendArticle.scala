import collection.Seq
import com.typesafe.sbtscalariform.ScalariformPlugin
import java.io.File
import sbt._
import Keys._
import PlayProject._
import sbtassembly.Plugin._
import AssemblyKeys._

object FrontendArticle extends Build {

  private val appName = "frontend-article"
  private val appVersion = "1-SNAPSHOT"

  private val appDependencies = Seq(
    //dependencies included in distribution
    "com.gu.openplatform" %% "content-api-client" % "1.13",
    "com.gu" %% "configuration" % "3.6",
    "com.gu" %% "management-play" % "5.7",
    "com.gu" %% "management-logback" % "5.7",

    "com.gu" %% "frontend-common" % "1.0",

    //dependencies in test only
    "org.scalatest" %% "scalatest" % "1.7.1" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)
    .settings(ScalariformPlugin.settings ++ assemblySettings :_*)
    .settings(
      resolvers += "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
      // Disable Specs options to use ScalaTest
      testOptions in Test := Nil,
      organization := "com.gu",
      scalaVersion := "2.9.1",
      maxErrors := 20,
      javacOptions ++= Seq("-source", "1.6", "-target", "1.6", "-encoding", "utf8"),
      scalacOptions ++= Seq("-unchecked", "-optimise", "-deprecation", "-Xcheckinit", "-encoding", "utf8"),

      mainClass in assembly := Some("play.core.server.NettyServer"),
      jarName in assembly := "%s.jar" format appName,
      test in assembly := {},
      excludedFiles in assembly := { (base: Seq[File]) =>
        ((base / "logger.xml") +++ (base / "META-INF" / "MANIFEST.MF")).get
      },
      templatesImport ++= Seq(
        "content.Article",
        "frontend.common._"
      ),
      dist <<= myDistTask
    )

  def myDistTask = (assembly, streams, baseDirectory, target) map { (jar, s, baseDir, outDir) =>
    val log = s.log

    val distFile = outDir / "artifacts.zip"
    log.info("Disting %s ..." format distFile)

    if (distFile.exists) distFile.delete()

    val filesToZip = Seq(
      baseDir / "conf" / "deploy.json" -> "deploy.json",
      jar                              -> "packages/%s/%s".format(appName, jar.getName)
    )

    IO.zip(filesToZip, distFile)

    println("##teamcity[publishArtifacts '%s => .']" format distFile)

    log.info("Done disting.")
    jar
  }
}
