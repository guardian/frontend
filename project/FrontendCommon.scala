import sbt._
import Keys._
import PlayProject._
import frontend.Frontend._
import com.typesafe.sbtscalariform.ScalariformPlugin

object FrontendCommon extends Build {

  private val appName = "frontend-common"
  private val appVersion = "1.23-SNAPSHOT"

  private val appDependencies = Seq(
    "com.gu.openplatform" %% "content-api-client" % "1.15",
    "com.gu" %% "configuration" % "3.6",
    "org.jsoup" % "jsoup" % "1.6.2",
    "org.jboss.dna" % "dna-common" % "0.6",

    "org.scalatest" %% "scalatest" % "1.7.1" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)
    .settings(commonCompileSettings: _*)
    .settings(
    organization := "com.gu",
    testOptions in Test := Nil,

    resolvers ++= Seq(
        "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
        "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/",
        "Mvn Repository" at "http://mvnrepository.com/artifact/"
    ),

    //gets rid of scala-tools resolver as someone on the internet switched it off
    externalResolvers <<= resolvers map { rs =>
      Resolver.withDefaultResolvers(rs, scalaTools = false, mavenCentral = true)
    },

    // no javadoc
    publishArtifact in (Compile, packageDoc) := false,

    publishTo <<= (version) { version: String =>
        val publishType = if (version.endsWith("SNAPSHOT")) "snapshots" else "releases"
        Some(
            Resolver.file(
                "guardian github " + publishType,
                file(System.getProperty("user.home") + "/guardian.github.com/maven/repo-" + publishType)
            )
        )
    },

    templatesImport ++= Seq(
      "common._",
      "views._",
      "views.support._"
    )
  )
}
