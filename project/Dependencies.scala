package com.gu

import sbt._

object Dependencies {
  val cucumberVersion = "1.1.5"
  val identityLibVersion = "3.41"
  val seleniumVersion = "2.39.0"
  val slf4jVersion = "1.7.5"

  val akkaAgent = "com.typesafe.akka" %% "akka-agent" % "2.3.4"
  val akkaContrib = "com.typesafe.akka" %% "akka-contrib" % "2.3.5"
  val apacheCommonsMath3 = "org.apache.commons" % "commons-math3" % "3.2"
  val awsSdk = "com.amazonaws" % "aws-java-sdk" % "1.8.7"
  val chargebee = "org.json" % "org.json" % "chargebee-1.0"
  val commonsCodec = "commons-codec" % "commons-codec" % "1.6"
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val contentApiClient = "com.gu" %% "content-api-client" % "2.19"
  val cucumberJava = "info.cukes" % "cucumber-java" % cucumberVersion
  val cucumberJUnit = "info.cukes" % "cucumber-junit" % cucumberVersion
  val cucumberPicoContainer = "info.cukes" % "cucumber-picocontainer" % cucumberVersion
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "1.27.0"
  val dnaCommon = "org.jboss.dna" % "dna-common" % "0.6"
  val exactTargetClient = "com.gu" %% "exact-target-client" % "2.23"
  val guardianConfiguration = "com.gu" %% "configuration" % "3.9"
  val guice = "com.google.inject" % "guice" % "3.0"
  val identityCookie = "com.gu.identity" %% "identity-cookie" % identityLibVersion
  val identityModel = "com.gu.identity" %% "identity-model" % identityLibVersion
  val identityRequest = "com.gu.identity" %% "identity-request" % identityLibVersion
  val jacksonCore = "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6"
  val jacksonMapper = "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6"
  val jodaTime = "joda-time" % "joda-time" % "2.2"
  val jSoup = "org.jsoup" % "jsoup" % "1.6.3"
  val jUnit = "junit" % "junit" % "4.11" % "test"
  val jUnitInterface = "com.novocode" % "junit-interface" % "0.10" % "test->default"
  val liftJson = "net.liftweb" %% "lift-json" % "2.5"
  val logbackClassic = "ch.qos.logback" % "logback-classic" % "1.0.7"
  val mezaAao = "hu.meza" % "aao" % "2.0.0"
  val mezaConfig = "hu.meza.tools" % "config" % "1.0.1"
  val mezaGaLib = "hu.meza.tools" % "galib" % "1.0.2"
  val mezaHttpClientWrapper = "hu.meza.tools" % "http-client-wrapper" % "0.1.9"
  val nScalaTime = "com.github.nscala-time" %% "nscala-time" % "1.2.0"
  val openCsv = "net.sf.opencsv" % "opencsv" % "2.3"
  val paClient = "com.gu" %% "pa-client" % "5.0.1-NG"
  val playGoogleAuth = "com.gu" %% "play-googleauth" % "0.1.56-SNAPSHOT"
  val playJsonVariants = "org.julienrf" %% "play-json-variants" % "0.2"
  val postgres = "postgresql" % "postgresql" % "8.4-703.jdbc4" from "http://jdbc.postgresql.org/download/postgresql-8.4-703.jdbc4.jar"
  val quartzScheduler = "org.quartz-scheduler" % "quartz" % "2.2.0"
  val rome = "rome" % "rome" % "1.0"
  val romeModules = "org.rometools" % "rome-modules" % "1.0"
  val scalaCheck = "org.scalacheck" %% "scalacheck" % "1.11.5" % "test"
  val scalajTime = "org.scalaj" % "scalaj-time_2.10.2" % "0.7"
  val seeGuice = "com.tzavellas" % "sse-guice" % "0.7.1"
  val seleniumJava = "org.seleniumhq.selenium" % "selenium-java" % seleniumVersion
  val seleniumServer = "org.seleniumhq.selenium" % "selenium-server" % seleniumVersion
  val shadeMemcached = "com.bionicspirit" %% "shade" % "1.5.0"
  val slf4jApi = "org.slf4j" % "slf4j-api" % slf4jVersion
  val slf4jExt = "org.slf4j" % "slf4j-ext" % slf4jVersion
  val slick = "com.typesafe.slick" %% "slick" % "1.0.0"
  val snappyJava = "org.xerial.snappy" % "snappy-java" % "1.0.5.1"
  val uaDetectorResources = "net.sf.uadetector" % "uadetector-resources" % "2013.04"
  val velocity = "org.apache.velocity" % "velocity" % "1.7"
}
