package com.gu

import sbt._

object Dependencies {
  val cucumberVersion = "1.1.5"
  val identityLibVersion = "3.49"
  val seleniumVersion = "2.44.0"
  val slf4jVersion = "1.7.5"
  val awsVersion = "1.10.37"

  val akkaAgent = "com.typesafe.akka" %% "akka-agent" % "2.3.4"
  val akkaContrib = "com.typesafe.akka" %% "akka-contrib" % "2.3.5"
  val apacheCommonsMath3 = "org.apache.commons" % "commons-math3" % "3.2"
  val awsCore = "com.amazonaws" % "aws-java-sdk-core" % awsVersion
  val awsCloudwatch = "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion
  val awsDynamodb = "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion
  val awsKinesis = "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion
  val awsS3 = "com.amazonaws" % "aws-java-sdk-s3" % awsVersion
  val awsSes = "com.amazonaws" % "aws-java-sdk-ses" % awsVersion
  val awsSns = "com.amazonaws" % "aws-java-sdk-sns" % awsVersion
  val awsSqs = "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion
  val awsElasticloadbalancing = "com.amazonaws" % "aws-java-sdk-elasticloadbalancing" % awsVersion
  val closureCompiler = "com.google.javascript" % "closure-compiler" % "v20150901"
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val commonsIo = "commons-io" % "commons-io" % "2.4"
  val cssParser = "net.sourceforge.cssparser" % "cssparser" % "0.9.18"
  val contentApiClient = "com.gu" %% "content-api-client" % "7.13"
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "2.8.0"
  val dispatch = "net.databinder.dispatch" %% "dispatch-core" % "0.11.3"
  val dispatchTest = "net.databinder.dispatch" %% "dispatch-core" % "0.11.3" % Test
  val exactTargetClient = "com.gu" %% "exact-target-client" % "2.24"
  val faciaFapiScalaClient = "com.gu" %% "fapi-client" % "0.68"
  val faciaScalaClient = "com.gu" %% "facia-json" % "0.68"
  val flexibleContentBlockToText = "com.gu" %% "flexible-content-block-to-text" % "0.4"
  val flexibleContentBodyParser = "com.gu" %% "flexible-content-body-parser" % "0.6"
  val googleSheetsApi = "com.google.gdata" % "core" % "1.47.1"
  val guardianConfiguration = "com.gu" %% "configuration" % "4.1"
  val guice = "com.google.inject" % "guice" % "3.0"
  val identityCookie = "com.gu.identity" %% "identity-cookie" % identityLibVersion
  val identityModel = "com.gu.identity" %% "identity-model" % identityLibVersion
  val identityRequest = "com.gu.identity" %% "identity-request" % identityLibVersion
  val jacksonCore = "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6"
  val jacksonMapper = "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6"
  val jodaTime = "joda-time" % "joda-time" % "2.9.1"
  val jodaConvert = "org.joda" % "joda-convert" % "1.2"
  val jSoup = "org.jsoup" % "jsoup" % "1.7.3"
  val liftJson = "net.liftweb" %% "lift-json" % "2.6-RC2"
  val mockito = "org.mockito" % "mockito-all" % "1.9.5" % Test
  val nScalaTime = "com.github.nscala-time" %% "nscala-time" % "1.2.0"
  val openCsv = "net.sf.opencsv" % "opencsv" % "2.3"
  val paClient = "com.gu" %% "pa-client" % "5.0.1-NG"
  val playGoogleAuth = "com.gu" %% "play-googleauth" % "0.3.3"
  val quartzScheduler = "org.quartz-scheduler" % "quartz" % "2.2.1"
  val rome = "rome" % "rome" % "1.0"
  val romeModules = "org.rometools" % "rome-modules" % "1.0"
  val scalaCheck = "org.scalacheck" %% "scalacheck" % "1.11.5" % "test"
  val scalajTime = "org.scalaj" % "scalaj-time_2.10.2" % "0.7"
  val scalaTest = "org.scalatest" %% "scalatest" % "2.2.5" % Test
  val scalaz = "org.scalaz" %% "scalaz-core" % "7.0.6"
  val scalaUri = "com.netaporter" % "scala-uri_2.11" % "0.4.11"
  val seeGuice = "com.tzavellas" % "sse-guice" % "0.7.1"
  val seleniumJava = "org.seleniumhq.selenium" % "selenium-java" % seleniumVersion
  val shadeMemcached = "com.bionicspirit" %% "shade" % "1.6.0"
  val slf4jExt = "org.slf4j" % "slf4j-ext" % slf4jVersion
  val snappyJava = "org.xerial.snappy" % "snappy-java" % "1.0.5.1"
  val uaDetectorResources = "net.sf.uadetector" % "uadetector-resources" % "2013.04"
  val scalaTestPlus = "org.scalatestplus" %% "play" % "1.4.0-M3" % "test"
  val anormModule = "com.typesafe.play" %% "anorm" % "2.4.0"
  val jerseyCore = "com.sun.jersey" % "jersey-core" % "1.19"
  val jerseyClient = "com.sun.jersey" % "jersey-client" % "1.19"
  val w3cSac = "org.w3c.css" % "sac" % "1.3"

  // Web jars
  val bootstrap = "org.webjars" % "bootstrap" % "3.3.5"
  val jquery = "org.webjars" % "jquery" % "2.1.4"
  val jqueryui = "org.webjars" % "jquery-ui" % "1.11.4"
  val lodash = "org.webjars" % "lodash" % "3.9.0"
  val react = "org.webjars" % "react" % "0.13.3"
}
