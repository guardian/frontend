package com.gu

import sbt._

object Dependencies {
  val identityLibVersion = "4.17"
  val awsVersion = "1.12.638"
  val capiVersion = "19.4.1"
  val faciaVersion = "4.0.6"
  val dispatchVersion = "0.13.1"
  val romeVersion = "1.0"
  val jerseyVersion = "1.19.4"
  val playJsonVersion = "2.9.4"
  val playJsonExtensionsVersion = "0.42.0"
  val apacheCommonsLang = "org.apache.commons" % "commons-lang3" % "3.11"
  val awsCore = "com.amazonaws" % "aws-java-sdk-core" % awsVersion
  val awsCloudwatch = "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion
  val awsDynamodb = "com.amazonaws" % "aws-java-sdk-dynamodb" % awsVersion
  val awsEc2 = "com.amazonaws" % "aws-java-sdk-ec2" % awsVersion
  val awsKinesis = "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion
  val awsS3 = "com.amazonaws" % "aws-java-sdk-s3" % awsVersion
  val eTagCachingS3 = "com.gu.etag-caching" %% "aws-s3-sdk-v2" % "1.0.4"
  val awsSes = "com.amazonaws" % "aws-java-sdk-ses" % awsVersion
  val awsSns = "com.amazonaws" % "aws-java-sdk-sns" % awsVersion
  val awsSts = "com.amazonaws" % "aws-java-sdk-sts" % awsVersion
  val awsSqs = "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion
  val awsSsm = "com.amazonaws" % "aws-java-sdk-ssm" % awsVersion
  val awsElasticloadbalancing = "com.amazonaws" % "aws-java-sdk-elasticloadbalancing" % awsVersion
  val closureCompiler = "com.google.javascript" % "closure-compiler" % "v20230228"
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val commonsLang = "commons-lang" % "commons-lang" % "2.6"
  val commonsIo = "commons-io" % "commons-io" % "2.7"
  val cssParser = "net.sourceforge.cssparser" % "cssparser" % "0.9.23"
  val contentApiClient = "com.gu" %% "content-api-client" % capiVersion
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "5.2.0"
  val faciaFapiScalaClient = "com.gu" %% "fapi-client-play28" % faciaVersion
  val identityCookie = "com.gu.identity" %% "identity-cookie" % identityLibVersion

  /**
    * There can only be one version of `scala-xml`. We will evict all v1.x
    *
    * Upgrade from v1 to v2 should be relatively safe, according to this thread:
    * https://github.com/scala/scala-xml/discussions/605#discussioncomment-2828193
    *
    * Make sure that `scala-xml_***` matches the Scala version in ProjectSettings.scala
    */
  val excludeDirectScalaXMLDependency =
    ExclusionRule("org.scala-lang.modules", "scala-xml_2.13")
  val identityModel = ("com.gu.identity" %% "identity-model" % identityLibVersion)
    .excludeAll(excludeDirectScalaXMLDependency)
  val identityAuthPlay = ("com.gu.identity" %% "identity-auth-play" % identityLibVersion)
    .excludeAll(excludeDirectScalaXMLDependency)

  val mockWs = "de.leanovate.play-mockws" %% "play-mockws" % "2.6.2" % Test
  val jodaTime = "joda-time" % "joda-time" % "2.9.9"
  val jodaConvert = "org.joda" % "joda-convert" % "1.8.3"
  val jSoup = "org.jsoup" % "jsoup" % "1.15.3"
  val json4s = "org.json4s" %% "json4s-native" % "4.0.4"
  val macwire = "com.softwaremill.macwire" %% "macros" % "2.5.7" % "provided"
  val mockito = "org.mockito" % "mockito-all" % "1.10.19" % Test
  val paClient = "com.gu" %% "pa-client" % "7.0.7"
  val playGoogleAuth = "com.gu.play-googleauth" %% "play-v28" % "2.2.7"
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
  val scalaTestPlus = "org.scalatestplus.play" %% "scalatestplus-play" % "6.0.1" % Test
  val scalaTestPlusMockito = "org.scalatestplus" %% "mockito-4-11" % "3.2.16.0" % Test
  val scalaTestPlusScalacheck = "org.scalatestplus" %% "scalacheck-1-17" % "3.2.17.0" % Test
  val scalaUri = "io.lemonlabs" %% "scala-uri" % "3.0.0"
  val seleniumJava = "org.seleniumhq.selenium" % "selenium-java" % "4.8.1"
  val slf4jExt = "org.slf4j" % "slf4j-ext" % "1.7.36"
  val jerseyCore = "com.sun.jersey" % "jersey-core" % jerseyVersion
  val jerseyClient = "com.sun.jersey" % "jersey-client" % jerseyVersion
  val w3cSac = "org.w3c.css" % "sac" % "1.3"
  val libPhoneNumber = "com.googlecode.libphonenumber" % "libphonenumber" % "8.10.0"
  val pekkoVersion = "1.0.1"
  val pekkoActor = "org.apache.pekko" %% "pekko-actor" % pekkoVersion
  val pekkoStream = "org.apache.pekko" %% "pekko-stream" % pekkoVersion
  val pekkoSlf4j = "org.apache.pekko" %% "pekko-slf4j" % pekkoVersion

  val logback2 = "net.logstash.logback" % "logstash-logback-encoder" % "4.6"
  // logback2  to prevent "error: reference to logback is ambiguous;"

  val kinesisLogbackAppender = "com.gu" % "kinesis-logback-appender" % "1.4.0"
  val targetingClient = "com.gu" %% "targeting-client" % "1.1.4"
  val scanamo = "org.scanamo" %% "scanamo" % "1.0.0-M11"
  val enumeratumPlayJson = "com.beachape" %% "enumeratum-play-json" % "1.7.0"
  val commercialShared = "com.gu" %% "commercial-shared" % "6.1.8"
  val playJson = "com.typesafe.play" %% "play-json" % playJsonVersion
  val playJsonExtensions = "ai.x" %% "play-json-extensions" % playJsonExtensionsVersion
  val playJsonJoda = "com.typesafe.play" %% "play-json-joda" % playJsonVersion
  val atomRenderer = "com.gu" %% "atom-renderer" % "1.2.0"
  val supportInternationalisation = "com.gu" %% "support-internationalisation" % "0.13"
  val capiAws = "com.gu" %% "content-api-client-aws" % "0.7"

  /*
    Note: Although frontend compiles and passes all the current tests when jackson is removed, be careful that this
    may break the fronts diagnostics tools. If we try to remove jackson one day after (for instance after other
    dependencies have been upgraded), then do remember to check for regressions.

    The versions are currently set as they are because of:
    https://github.com/orgs/playframework/discussions/11222
   */
  val jacksonVersion = "2.13.4"
  val jacksonDatabindVersion = "2.13.4.1"
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

  // Forcing a version of this to fix an issue with the dependency.
  // This is a transitive dependency of the AWS SDK used by etag-caching library
  val nettyCodecHttp2 = "io.netty" % "netty-codec-http2" % "4.1.100.Final"

  // Web jars
  val bootstrap = "org.webjars" % "bootstrap" % "3.3.7"
  val jquery = "org.webjars" % "jquery" % "3.7.1"
  val jqueryui = "org.webjars" % "jquery-ui" % "1.13.2"
  val lodash = "org.webjars.npm" % "lodash" % "4.17.21"
  val react = "org.webjars" % "react" % "15.6.1"
  val epoch = "org.webjars.npm" % "epoch-charting" % "0.8.4"
  val d3 = "org.webjars.npm" % "d3" % "3.5.17"
}
