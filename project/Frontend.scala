import sbt._
import sbt.Keys._
import play.Project._
import SbtGruntPlugin._

object Frontend extends Build with Prototypes {

  val common = grunt("common").settings(
    libraryDependencies ++= Seq(
      "com.gu" %% "configuration" % "3.9",
      "com.gu.openplatform" %% "content-api-client" % "2.6",

      "com.typesafe.akka" %% "akka-agent" % "2.1.0",

      "org.jsoup" % "jsoup" % "1.6.3",
      "com.googlecode.htmlcompressor" % "htmlcompressor" % "1.4",
      "com.yahoo.platform.yui" % "yuicompressor" % "2.4.6",

      "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6",
      "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6",

      "com.amazonaws" % "aws-java-sdk" % "1.4.7",

      "org.quartz-scheduler" % "quartz" % "2.2.0",

      "org.jboss.dna" % "dna-common" % "0.6",
      "org.scalaj" % "scalaj-time_2.10.0-M7" % "0.6"
    ),
    (test in Test) <<= (test in Test) dependsOn (gruntTask("test:unit:common"))
  )
  val commonWithTests = common % "test->test;compile->compile"

  val front = application("front").dependsOn(commonWithTests).aggregate(common)
  val facia = application("facia").dependsOn(commonWithTests).aggregate(common)
  val article = application("article").dependsOn(commonWithTests).aggregate(common)
  val interactive = application("interactive").dependsOn(commonWithTests).aggregate(common)
  val applications = application("applications").dependsOn(commonWithTests).aggregate(common)
  val football = application("football").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies += "com.gu" %% "pa-client" % "4.0",
    templatesImport ++= Seq(
      "pa._",
      "feed._"
    )
  )
  val sport = application("sport").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies += "com.gu" %% "pa-client" % "4.0",
    templatesImport ++= Seq(
      "pa._",
      "feed._"
    )
  )
  val coreNavigation = application("core-navigation").dependsOn(commonWithTests).aggregate(common)
  val image = application("image").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      "org.imgscalr" % "imgscalr-lib" % "4.2",
      "org.im4java" % "im4java" % "1.4.0",
      "commons-io" % "commons-io" % "2.0.1",
      "commons-lang" % "commons-lang" % "2.5"
    )
  )
  val discussion = application("discussion").dependsOn(commonWithTests).aggregate(common).settings(
    templatesImport ++= Seq("discussion._")
  )

  val router = application("router")

  val diagnostics = application("diagnostics").settings(
    libraryDependencies ++= Seq(
      "net.sf.uadetector" % "uadetector-resources" % "2013.04",
      "net.sf.opencsv" % "opencsv" % "2.3"
    )
  )

  val admin = application("admin").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      "com.novus" %% "salat" % "1.9.2-SNAPSHOT-20130624"
    ),
    (test in Test) <<= (test in Test) dependsOn (gruntTask("test:unit:admin"))
  )
  val faciaTool = application("facia-tool").dependsOn(commonWithTests, admin)
  val porter = application("porter").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      "com.typesafe.slick" %% "slick" % "1.0.0",
      "postgresql" % "postgresql" % "8.4-703.jdbc4" from "http://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar"
    )
  )

  val identityLibVersion = "3.21"
  val identity = application("identity").dependsOn(commonWithTests).aggregate(common).settings(
    libraryDependencies ++= Seq(
      "com.gu.identity" %% "identity-model" % identityLibVersion,
      "com.gu.identity" %% "identity-request" % identityLibVersion,
      "com.gu.identity" %% "identity-cookie" % identityLibVersion,
      "com.tzavellas" % "sse-guice" % "0.7.1",
      "com.google.inject" % "guice" % "3.0",
      "joda-time" % "joda-time" % "1.6",
      "net.liftweb" %% "lift-json" % "2.5",
      "commons-httpclient" % "commons-httpclient" % "3.1",
      "net.databinder.dispatch" %% "dispatch-core" % "0.11.0",
      "org.mockito" % "mockito-all" % "1.9.5" % "test",
      "org.slf4j" % "slf4j-ext" % "1.7.5"
    )
  )

  val endtoend = application("fronts-endtoend-tests").settings(
    libraryDependencies ++= Seq(
      "org.slf4j" % "slf4j-api" % "1.7.5",
      "ch.qos.logback" % "logback-classic" % "1.0.7",
      "org.json" % "org.json" % "chargebee-1.0",
      "joda-time" % "joda-time" % "2.2",
      "hu.meza" % "aao" % "2.0.0",
      "hu.meza.tools" % "config" % "1.0.1",
      "hu.meza.tools" % "http-client-wrapper" % "0.1.9",
      "info.cukes" % "cucumber-java" % "1.1.3",
      "info.cukes" % "cucumber-junit" % "1.1.3",
      "info.cukes" % "cucumber-picocontainer" % "1.1.3",
      "junit" % "junit" % "4.11" % "test",
      "com.novocode" % "junit-interface" % "0.10" % "test->default"
    ),
    testOptions += Tests.Argument(TestFrameworks.JUnit, "-q", "-v"),
    javacOptions ++= Seq("-source", "7", "-target", "1.7"),
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

  val dev = base("dev-build").dependsOn(
    front,
    facia,
    article,
    applications,
    interactive,
    football,
    sport,
    coreNavigation,
    image,
    discussion,
    router,
    diagnostics,
    identity)

  val faciaDev = application("facia-dev-build").dependsOn(
    facia,
    article,
    applications,
    football,
    coreNavigation,
    image,
    discussion)

  val main = root().aggregate(
    common,
    front,
    facia,
    article,
    applications,
    interactive,
    football,
    sport,
    coreNavigation,
    image,
    discussion,
    router,
    diagnostics,
    admin,
    porter,
    identity
  )
}
