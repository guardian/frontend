package com.gu

import sbt._

object Dependencies {
  val identityLibVersion = "3.254"
  val awsVersion = "1.12.205"
  val capiVersion = "19.1.1"
  val faciaVersion = "4.0.4"
  val dispatchVersion = "0.13.1"
  val romeVersion = "1.0"
  val jerseyVersion = "1.19.4"
  val playJsonVersion = "2.9.2"
  val playJsonExtensionsVersion = "0.42.0"
  val apacheCommonsLang = "org.apache.commons" % "commons-lang3" % "3.11"
  val awsCore = "com.amazonaws" % "aws-java-sdk-core" % awsVersion
  val awsCloudwatch = "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion
  val awsDynamodb = "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion
  val awsEc2 = "com.amazonaws" % "aws-java-sdk-ec2" % awsVersion
  val awsKinesis = "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion
  val awsS3 = "com.amazonaws" % "aws-java-sdk-s3" % awsVersion
  val awsSes = "com.amazonaws" % "aws-java-sdk-ses" % awsVersion
  val awsSns = "com.amazonaws" % "aws-java-sdk-sns" % awsVersion
  val awsSts = "com.amazonaws" % "aws-java-sdk-sts" % awsVersion
  val awsSqs = "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion
  val awsSsm = "com.amazonaws" % "aws-java-sdk-ssm" % awsVersion
  val awsElasticloadbalancing = "com.amazonaws" % "aws-java-sdk-elasticloadbalancing" % awsVersion
  val closureCompiler = "com.google.javascript" % "closure-compiler" % "v20150901"
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val commonsLang = "commons-lang" % "commons-lang" % "2.6"
  val commonsIo = "commons-io" % "commons-io" % "2.5"
  val cssParser = "net.sourceforge.cssparser" % "cssparser" % "0.9.23"
  val contentApiClient = "com.gu" %% "content-api-client" % capiVersion
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "4.20.0"
  val faciaFapiScalaClient = "com.gu" %% "fapi-client-play27" % faciaVersion
  val identityCookie = "com.gu.identity" %% "identity-cookie" % identityLibVersion
  val identityModel = "com.gu.identity" %% "identity-model" % identityLibVersion
  val identityAuthPlay = "com.gu.identity" %% "identity-auth-play" % identityLibVersion
  val mockWs = "de.leanovate.play-mockws" %% "play-mockws" % "2.6.2" % Test
  val jodaTime = "joda-time" % "joda-time" % "2.9.9"
  val jodaConvert = "org.joda" % "joda-convert" % "1.8.3"
  val jSoup = "org.jsoup" % "jsoup" % "1.10.3"
  val json4s = "org.json4s" %% "json4s-native" % "4.0.4"
  val macwire = "com.softwaremill.macwire" %% "macros" % "2.5.7" % "provided"
  val mockito = "org.mockito" % "mockito-all" % "1.10.19" % Test
  val paClient = "com.gu" %% "pa-client" % "7.0.5"
  val playGoogleAuth = "com.gu.play-googleauth" %% "play-v28" % "2.1.1"
  val playSecretRotation = "com.gu.play-secret-rotation" %% "play-v28" % "0.18"
  val playSecretRotationAwsSdk = "com.gu.play-secret-rotation" %% "aws-parameterstore-sdk-v1" % "0.18"
  val quartzScheduler = "org.quartz-scheduler" % "quartz" % "2.3.2"
  val redisClient = "net.debasishg" %% "redisclient" % "3.42"
  val rome = "rome" % "rome" % romeVersion
  val romeModules = "org.rometools" % "rome-modules" % romeVersion
  val scalaCheck = "org.scalacheck" %% "scalacheck" % "1.16.0" % Test
  val scalaCollectionPlus = "com.madgag" %% "scala-collection-plus" % "0.11"
  val nScalaTime = "com.github.nscala-time" %% "nscala-time" % "2.30.0"
  val scalaTest = "org.scalatest" %% "scalatest" % "3.2.11" % Test
  val scalaTestPlus = "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test
  val scalaTestPlusMockito = "org.scalatestplus" %% "mockito-3-4" % "3.3.0.0-SNAP3" % Test
  val scalaTestPlusScalacheck = "org.scalatestplus" %% "scalacheck-1-15" % "3.2.11.0" % Test
  val scalaUri = "io.lemonlabs" %% "scala-uri" % "3.0.0"
  val seleniumJava = "org.seleniumhq.selenium" % "selenium-java" % "2.44.0"
  val slf4jExt = "org.slf4j" % "slf4j-ext" % "1.7.36"
  val jerseyCore = "com.sun.jersey" % "jersey-core" % jerseyVersion
  val jerseyClient = "com.sun.jersey" % "jersey-client" % jerseyVersion
  val w3cSac = "org.w3c.css" % "sac" % "1.3"
  val libPhoneNumber = "com.googlecode.libphonenumber" % "libphonenumber" % "8.10.0"

  val logback2 = "net.logstash.logback" % "logstash-logback-encoder" % "4.6"
  // logback2  to prevent "error: reference to logback is ambiguous;"

  val kinesisLogbackAppender = "com.gu" % "kinesis-logback-appender" % "1.4.0"
  val targetingClient = "com.gu" %% "targeting-client" % "1.1.2"
  val scanamo = "org.scanamo" %% "scanamo" % "1.0.0-M11"
  val enumeratumPlayJson = "com.beachape" %% "enumeratum-play-json" % "1.7.0"
  val commercialShared = "com.gu" %% "commercial-shared" % "6.1.7"
  val playJson = "com.typesafe.play" %% "play-json" % playJsonVersion
  val playJsonExtensions = "ai.x" %% "play-json-extensions" % playJsonExtensionsVersion
  val playJsonJoda = "com.typesafe.play" %% "play-json-joda" % playJsonVersion
  val atomRenderer = "com.gu" %% "atom-renderer" % "1.2.0"
  val supportInternationalisation = "com.gu" %% "support-internationalisation" % "0.13"
  val capiAws = "com.gu" %% "content-api-client-aws" % "0.7"
  val okhttp = "com.squareup.okhttp3" % "okhttp" % "4.10.0"

  /*
    Note: Although frontend compiles and passes all the current tests when jackson is removed, be careful that this
    may break the fronts diagnostics tools. If we try to remove jackson one day after (for instance after other
    dependencies have been upgraded), then do remember to check for regressions.

    The versions are currently set as they are because of:
    https://github.com/orgs/playframework/discussions/11222
   */
  val jacksonVersion = "2.13.2"
  val jacksonDatabindVersion = "2.13.2.2"
  val jacksonCore = "com.fasterxml.jackson.core" % "jackson-core" % jacksonVersion
  val jacksonAnnotations = "com.fasterxml.jackson.core" % "jackson-annotations" % jacksonVersion
  val jacksonDataTypeJdk8 = "com.fasterxml.jackson.datatype" % "jackson-datatype-jdk8" % jacksonVersion
  val jacksonDataType = "com.fasterxml.jackson.datatype" % "jackson-datatype-jsr310" % jacksonVersion
  val jacksonDataFormat = "com.fasterxml.jackson.dataformat" % "jackson-dataformat-cbor" % jacksonVersion
  val jacksonParameterName = "com.fasterxml.jackson.module" % "jackson-module-parameter-names" % jacksonVersion
  val jackModule = "com.fasterxml.jackson.module" %% "jackson-module-scala" % jacksonVersion
  val jacksonDatabind = "com.fasterxml.jackson.core" % "jackson-databind" % jacksonDatabindVersion

  val jackson =
    Seq(
      jacksonCore,
      jacksonAnnotations,
      jacksonDataTypeJdk8,
      jacksonDataType,
      jacksonDataFormat,
      jacksonParameterName,
      jackModule,
      jacksonDatabind,
    )

  // Web jars
  val bootstrap = "org.webjars" % "bootstrap" % "3.3.7"
  val jquery = "org.webjars" % "jquery" % "3.2.1"
  val jqueryui = "org.webjars" % "jquery-ui" % "1.12.1"
  val lodash = "org.webjars" % "lodash" % "4.17.15"
  val react = "org.webjars" % "react" % "15.6.1"
  val epoch = "org.webjars.npm" % "epoch-charting" % "0.8.4"
  val d3 = "org.webjars.npm" % "d3" % "3.5.17"
}
