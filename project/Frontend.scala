package com.gu

import sbt._
import sbt.Keys._
import play.Project._

object Frontend extends Build with Prototypes {

  val common = application("common").settings(
    libraryDependencies ++= Seq(
      "com.gu" %% "configuration" % "3.9",
      "com.gu" %% "content-api-client" % "2.18",

      "com.typesafe.akka" %% "akka-agent" % "2.1.0",

      "org.jsoup" % "jsoup" % "1.6.3",

      "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6",
      "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6",

      "com.amazonaws" % "aws-java-sdk" % "1.6.10",

      "org.quartz-scheduler" % "quartz" % "2.2.0",

      "org.jboss.dna" % "dna-common" % "0.6",
      "org.scalaj" % "scalaj-time_2.10.2" % "0.7",

      "org.apache.commons" % "commons-math3" % "3.2",

      "com.bionicspirit" %% "shade" % "1.5.0",

      "rome" % "rome" % "1.0",
      "org.rometools" % "rome-modules" % "1.0",

      "org.xerial.snappy" % "snappy-java" % "1.0.5.1",

      filters
    )
  )
  val paVersion = "5.0.0"

  def withTests(project: Project) = project % "test->test;compile->compile"

  val commonWithTests = withTests(common)

  val facia = application("facia").dependsOn(commonWithTests).aggregate(common)
  val article = application("article").dependsOn(commonWithTests).aggregate(common)
  val applications = application("applications").dependsOn(commonWithTests).aggregate(common)
  val archive = application("archive").dependsOn(commonWithTests).aggregate(common)
  val sport = application("sport").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies += "com.gu" %% "pa-client" % paVersion,
    templatesImport ++= Seq(
      "pa._",
      "feed._",
      "football.controllers._"
    )
  )

  val image = application("image")

  val discussion = application("discussion").dependsOn(commonWithTests).aggregate(common).settings(
    templatesImport ++= Seq("discussion._", "discussion.model._")
  )

  val router = application("router")

  val diagnostics = application("diagnostics").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      "net.sf.uadetector" % "uadetector-resources" % "2013.04",
      "net.sf.opencsv" % "opencsv" % "2.3"
    )
  )

  val admin = application("admin").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      "com.typesafe.slick" %% "slick" % "1.0.0",
      "postgresql" % "postgresql" % "8.4-703.jdbc4" from "http://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar",
      "com.gu" %% "pa-client" % paVersion,
      "com.google.api-ads" % "dfp-axis" % "1.27.0"
    )
  )

  val faciaTool = application("facia-tool").dependsOn(commonWithTests)

  val identityLibVersion = "3.21"
  val identity = application("identity").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      filters,
      "com.gu.identity" %% "identity-model" % identityLibVersion,
      "com.gu.identity" %% "identity-request" % identityLibVersion,
      "com.gu.identity" %% "identity-cookie" % identityLibVersion,
      "com.tzavellas" % "sse-guice" % "0.7.1",
      "com.google.inject" % "guice" % "3.0",
      "joda-time" % "joda-time" % "1.6",
      "net.liftweb" %% "lift-json" % "2.5",
      "commons-httpclient" % "commons-httpclient" % "3.1",
      "org.slf4j" % "slf4j-ext" % "1.7.5",
      "com.gu" %% "exact-target-client" % "2.23"
    )
  )

  val commercial = application("commercial").dependsOn(commonWithTests).aggregate(common)

  val onward = application("onward").dependsOn(commonWithTests).aggregate(common)

  val endtoend = application("fronts-endtoend-tests").settings(
    libraryDependencies ++= Seq(
      "org.slf4j" % "slf4j-api" % "1.7.5",
      "ch.qos.logback" % "logback-classic" % "1.0.7",
      "org.json" % "org.json" % "chargebee-1.0",
      "joda-time" % "joda-time" % "2.2",
      "hu.meza" % "aao" % "2.0.0",
      "hu.meza.tools" % "config" % "1.0.1",
      "hu.meza.tools" % "galib" % "1.0.2",
      "hu.meza.tools" % "http-client-wrapper" % "0.1.9",
      "commons-codec" % "commons-codec" % "1.6",
      "info.cukes" % "cucumber-java" % "1.1.5",
      "info.cukes" % "cucumber-junit" % "1.1.5",
      "org.apache.velocity" % "velocity" % "1.7",
      "info.cukes" % "cucumber-picocontainer" % "1.1.5",
      "org.seleniumhq.selenium" % "selenium-java" % "2.39.0",
      "org.seleniumhq.selenium" % "selenium-server" % "2.39.0",
      "junit" % "junit" % "4.11" % "test",
      "com.novocode" % "junit-interface" % "0.10" % "test->default"
    ),
    testOptions += Tests.Argument(TestFrameworks.JUnit, "-q", "-v"),
    javacOptions ++= Seq("-source", "7", "-target", "1.8"),
    autoScalaLibrary := false,
    unmanagedSourceDirectories in Compile <+= baseDirectory(_ / "src"),
    unmanagedSourceDirectories in Test <+= baseDirectory(_ / "src"),
    unmanagedSourceDirectories in Runtime <+= baseDirectory(_ / "src"),
    unmanagedResourceDirectories in Compile <+= baseDirectory(_ / "src" / "main" / "resources"),
    unmanagedResourceDirectories in Runtime <+= baseDirectory(_ / "src" / "main" / "resources"),
    unmanagedResourceDirectories in Test <+= baseDirectory(_ / "src" / "main" / "resources"),
    unmanagedResourceDirectories in Test <+= baseDirectory(_ / "src" / "test" / "resources"),
    unmanagedResourceDirectories in Runtime <+= baseDirectory(_ / "src" / "test" / "resources")
  )

  val dev = application("dev-build")
    .dependsOn(
      withTests(article)
    ).dependsOn(
      facia,
      applications,
      archive,
      sport,
      discussion,
      diagnostics,
      identity,
      admin,
      commercial,
      onward
    )

  // this app has a very limited set.
  // it is designed to get all other services (e.g. onwards) from PROD
  val preview = application("preview").dependsOn(
    withTests(common),
    article,
    facia,
    applications,
    sport,
    commercial,
    onward
  )

  val main = root().aggregate(
    common,
    facia,
    faciaTool,
    article,
    applications,
    sport,
    image,
    discussion,
    router,
    diagnostics,
    admin,
    identity,
    commercial,
    onward,
    archive,
    preview
  )
}
