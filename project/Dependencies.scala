package com.gu

import sbt._

object Dependencies {
  val cucumberVersion = "1.1.5"
  val identityLibVersion = "3.43"
  val seleniumVersion = "2.44.0"
  val slf4jVersion = "1.7.5"

  val akkaAgent = "com.typesafe.akka" %% "akka-agent" % "2.3.4"
  val akkaContrib = "com.typesafe.akka" %% "akka-contrib" % "2.3.5"
  val apacheCommonsMath3 = "org.apache.commons" % "commons-math3" % "3.2"
  val awsSdk = "com.amazonaws" % "aws-java-sdk" % "1.8.7"
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val commonsIo = "commons-io" % "commons-io" % "2.4"
  val contentApiClient = "com.gu" %% "content-api-client" % "3.4"
  val crosswordsApiClient = "com.gu" %% "crosswords-api-client" % "0.4"
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "1.35.1"
  val dnaCommon = "org.jboss.dna" % "dna-common" % "0.6"
  val exactTargetClient = "com.gu" %% "exact-target-client" % "2.23"
  val faciaScalaClient = "com.gu" %% "facia-api-client" % "0.12"
  val flexibleContentBlockToText = "com.gu" %% "flexible-content-block-to-text" % "0.1"
  val flexibleContentBodyParser = "com.gu" %% "flexible-content-body-parser" % "0.3"
  val guardianConfiguration = "com.gu" %% "configuration" % "3.9"
  val guice = "com.google.inject" % "guice" % "3.0"
  val identityCookie = "com.gu.identity" %% "identity-cookie" % identityLibVersion
  val identityModel = "com.gu.identity" %% "identity-model" % identityLibVersion
  val identityRequest = "com.gu.identity" %% "identity-request" % identityLibVersion
  val im4java = "org.im4java" % "im4java" % "1.4.0"
  val jacksonCore = "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6"
  val jacksonMapper = "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6"
  val jodaTime = "joda-time" % "joda-time" % "2.2"
  val jSoup = "org.jsoup" % "jsoup" % "1.7.3"
  val liftJson = "net.liftweb" %% "lift-json" % "2.5"
  val mockito = "org.mockito" % "mockito-all" % "1.9.5" % Test
  val nScalaTime = "com.github.nscala-time" %% "nscala-time" % "1.2.0"
  val openCsv = "net.sf.opencsv" % "opencsv" % "2.3"
  val paClient = "com.gu" %% "pa-client" % "5.0.1-NG"
  val playGoogleAuth = "com.gu" %% "play-googleauth" % "0.1.10"
  val playJsonVariants = "org.julienrf" %% "play-json-variants" % "0.2"
  val postgres = "postgresql" % "postgresql" % "8.4-703.jdbc4" from "http://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar"
  val quartzScheduler = "org.quartz-scheduler" % "quartz" % "2.2.0"
  val rome = "rome" % "rome" % "1.0"
  val romeModules = "org.rometools" % "rome-modules" % "1.0"
  val scalaCheck = "org.scalacheck" %% "scalacheck" % "1.11.5" % "test"
  val scalajTime = "org.scalaj" % "scalaj-time_2.10.2" % "0.7"
  val scalaTest = "org.scalatest" %% "scalatest" % "2.2.1" % Test
  val seeGuice = "com.tzavellas" % "sse-guice" % "0.7.1"
  val seleniumJava = "org.seleniumhq.selenium" % "selenium-java" % seleniumVersion
  val shadeMemcached = "com.bionicspirit" %% "shade" % "1.5.0"
  val slf4jExt = "org.slf4j" % "slf4j-ext" % slf4jVersion
  val snappyJava = "org.xerial.snappy" % "snappy-java" % "1.0.5.1"
  val uaDetectorResources = "net.sf.uadetector" % "uadetector-resources" % "2013.04"
  val scalaTestPlus = "org.scalatestplus" % "play_2.10" % "1.3.0" % "test"
}
