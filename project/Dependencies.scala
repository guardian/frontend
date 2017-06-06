package com.gu

import sbt._

object Dependencies {
  val cucumberVersion = "1.1.5"
  val identityLibVersion = "3.78"
  val seleniumVersion = "2.44.0"
  val slf4jVersion = "1.7.5"
  val awsVersion = "1.11.7"
  val faciaVersion = "2.1.3"
  val capiVersion = "11.12"
  val dispatchVersion = "0.11.3"
  val configurationMagicVersion = "1.2.2"
  val romeVersion = "1.0"
  val jerseyVersion = "1.19"

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
  val awsSts = "com.amazonaws" % "aws-java-sdk-sts" % awsVersion
  val awsSqs = "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion
  val awsElasticloadbalancing = "com.amazonaws" % "aws-java-sdk-elasticloadbalancing" % awsVersion
  val closureCompiler = "com.google.javascript" % "closure-compiler" % "v20150901"
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val commonsLang = "commons-lang" % "commons-lang" % "2.4"
  val commonsIo = "commons-io" % "commons-io" % "2.4"
  val cssParser = "net.sourceforge.cssparser" % "cssparser" % "0.9.21"
  val contentApiClient = "com.gu" %% "content-api-client" % capiVersion
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "2.20.0"
  val dispatch = "net.databinder.dispatch" %% "dispatch-core" % dispatchVersion
  val dispatchTest = "net.databinder.dispatch" %% "dispatch-core" % dispatchVersion % Test
  val exactTargetClient = "com.gu" %% "exact-target-client" % "2.24"
  val faciaFapiScalaClient = "com.gu" %% "fapi-client-play25" % faciaVersion
  val configMagic = "com.gu" %% "configuration-magic-core" %  configurationMagicVersion
  val configMagicPlay = "com.gu" %% "configuration-magic-play2-4" % configurationMagicVersion
  val identityCookie = "com.gu.identity" %% "identity-cookie" % identityLibVersion
  val identityModel = "com.gu.identity" %% "identity-model" % identityLibVersion
  val identityRequest = "com.gu.identity" %% "identity-request" % identityLibVersion
  val jodaTime = "joda-time" % "joda-time" % "2.9.1"
  val jodaConvert = "org.joda" % "joda-convert" % "1.2"
  val jSoup = "org.jsoup" % "jsoup" % "1.8.3"
  val liftJson = "net.liftweb" %% "lift-json" % "2.6-RC2"
  val json4s = "org.json4s" %% "json4s-native" % "3.4.0"
  val macwire = "com.softwaremill.macwire" %% "macros" % "2.2.3" % "provided"
  val mockito = "org.mockito" % "mockito-all" % "1.9.5" % Test
  val nScalaTime = "com.github.nscala-time" %% "nscala-time" % "1.2.0"
  val paClient = "com.gu" %% "pa-client" % "6.0.2"
  val playGoogleAuth = "com.gu" %% "play-googleauth" % "0.6.0"
  val quartzScheduler = "org.quartz-scheduler" % "quartz" % "2.2.1"
  val redisClient = "net.debasishg" %% "redisclient" % "3.1"
  val rome = "rome" % "rome" % romeVersion
  val romeModules = "org.rometools" % "rome-modules" % romeVersion
  val scalaCheck = "org.scalacheck" %% "scalacheck" % "1.11.5" % "test"
  val scalajTime = "org.scalaj" % "scalaj-time_2.10.2" % "0.7"
  val scalaTest = "org.scalatest" %% "scalatest" % "2.2.6" % Test
  val scalaTestPlus = "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test
  val scalaUri = "com.netaporter" %% "scala-uri" % "0.4.16"
  val seleniumJava = "org.seleniumhq.selenium" % "selenium-java" % seleniumVersion
  val shadeMemcached = "com.bionicspirit" %% "shade" % "1.6.0"
  val slf4jExt = "org.slf4j" % "slf4j-ext" % slf4jVersion
  val uaDetectorResources = "net.sf.uadetector" % "uadetector-resources" % "2013.04"
  val jerseyCore = "com.sun.jersey" % "jersey-core" % jerseyVersion
  val jerseyClient = "com.sun.jersey" % "jersey-client" % jerseyVersion
  val w3cSac = "org.w3c.css" % "sac" % "1.3"
  val libPhoneNumber = "com.googlecode.libphonenumber" % "libphonenumber" % "7.2.4"
  val logback = "net.logstash.logback" % "logstash-logback-encoder" % "4.6"
  val kinesisLogbackAppender = "com.gu" % "kinesis-logback-appender" % "1.3.0"
  val targetingClient = "com.gu" %% "targeting-client" % "0.11.0"
  val scanamo = "com.gu" %% "scanamo" % "0.8.3"
  val enumeratumPlayJson = "com.beachape" %% "enumeratum-play-json" % "1.5.6"
  val commercialShared = "com.gu" %% "commercial-shared" % "5.0.0"

  // Web jars
  val bootstrap = "org.webjars" % "bootstrap" % "3.3.5"
  val jquery = "org.webjars" % "jquery" % "2.1.4"
  val jqueryui = "org.webjars" % "jquery-ui" % "1.11.4"
  val lodash = "org.webjars" % "lodash" % "3.9.0"
  val react = "org.webjars" % "react" % "0.13.3"
  val epoch = "org.webjars.npm" % "epoch-charting" % "0.8.4"
  val d3 = "org.webjars.npm" % "d3" % "3.5.17"
}
