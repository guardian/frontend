package com.gu

import sbt._

object Dependencies {
  val identityLibVersion = "4.37.0"
  val awsVersion = "1.12.782"
  val awsSdk2Version = "2.30.38"
  val capiVersion = "34.0.0"
  val faciaVersion = "18.0.0"
  val dispatchVersion = "0.13.1"
  val romeVersion = "1.0"
  val jerseyVersion = "1.19.4"
  val playJsonVersion = "3.0.4"
  val apacheCommonsLang = "org.apache.commons" % "commons-lang3" % "3.17.0"
  val awsCore = "com.amazonaws" % "aws-java-sdk-core" % awsVersion
  val awsCloudwatch = "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsVersion
  val awsDynamodb = "software.amazon.awssdk" % "dynamodb" % awsSdk2Version
  val awsEc2 = "com.amazonaws" % "aws-java-sdk-ec2" % awsVersion
  val awsKinesis = "com.amazonaws" % "aws-java-sdk-kinesis" % awsVersion
  val awsS3 = "com.amazonaws" % "aws-java-sdk-s3" % awsVersion
  val eTagCachingS3 = "com.gu.etag-caching" %% "aws-s3-sdk-v2" % "7.0.2"
  val awsSes = "com.amazonaws" % "aws-java-sdk-ses" % awsVersion
  val awsSns = "com.amazonaws" % "aws-java-sdk-sns" % awsVersion
  val awsSts = "com.amazonaws" % "aws-java-sdk-sts" % awsVersion
  val awsV2Sts = "software.amazon.awssdk" % "sts" % awsSdk2Version
  val awsSqs = "com.amazonaws" % "aws-java-sdk-sqs" % awsVersion
  val awsSsm = "com.amazonaws" % "aws-java-sdk-ssm" % awsVersion
  val awsElasticloadbalancing = "com.amazonaws" % "aws-java-sdk-elasticloadbalancing" % awsVersion
  val closureCompiler = "com.google.javascript" % "closure-compiler" % "v20240317"
  val commonsHttpClient = "commons-httpclient" % "commons-httpclient" % "3.1"
  val commonsLang = "commons-lang" % "commons-lang" % "2.6"
  val commonsIo = "commons-io" % "commons-io" % "2.18.0"
  val cssParser = "net.sourceforge.cssparser" % "cssparser" % "0.9.30"
  val contentApiClient = "com.gu" %% "content-api-client" % capiVersion
  val contentApiModelsJson = "com.gu" %% "content-api-models-json" % "27.0.0"
  val dfpAxis = "com.google.api-ads" % "dfp-axis" % "5.8.0"
  val faciaFapiScalaClient = "com.gu" %% "fapi-client-play30" % faciaVersion
  val identityCookie = "com.gu.identity" %% "identity-cookie" % identityLibVersion

  /** There can only be one version of `scala-xml`. We will evict all v1.x
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
  val identityAuthCore = ("com.gu.identity" %% "identity-auth-core" % identityLibVersion)
    .excludeAll(excludeDirectScalaXMLDependency)

  val mockWs = "de.leanovate.play-mockws" %% "play-mockws" % "2.6.2" % Test
  val jodaTime = "joda-time" % "joda-time" % "2.14.0"
  val jodaConvert = "org.joda" % "joda-convert" % "2.2.4"
  val jSoup = "org.jsoup" % "jsoup" % "1.18.3"
  val json4s = "org.json4s" %% "json4s-native" % "4.0.7"
  val macwire = "com.softwaremill.macwire" %% "macros" % "2.6.6" % "provided"
  val mockito = "org.mockito" % "mockito-all" % "1.10.19" % Test
  val paClient = "com.gu" %% "pa-client" % "7.0.12"
  val panDomainAuth = "com.gu" %% "pan-domain-auth-play_3-0" % "9.0.2"
  val editorialPermissions = "com.gu" %% "editorial-permissions-client" % "4.0.0"
  val quartzScheduler = "org.quartz-scheduler" % "quartz" % "2.5.0"
  val redisClient = "net.debasishg" %% "redisclient" % "3.42"
  val rome = "rome" % "rome" % romeVersion
  val romeModules = "org.rometools" % "rome-modules" % romeVersion
  val scalaCheck = "org.scalacheck" %% "scalacheck" % "1.18.1" % Test
  val scalaCollectionPlus = "com.madgag" %% "scala-collection-plus" % "1.0.0"
  val nScalaTime = "com.github.nscala-time" %% "nscala-time" % "2.34.0"
  val scalaTest = "org.scalatest" %% "scalatest" % "3.2.19" % Test
  val scalaTestPlus = "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.1" % Test
  val scalaTestPlusMockito = "org.scalatestplus" %% "mockito-4-11" % "3.2.18.0" % Test
  val scalaTestPlusScalacheck = "org.scalatestplus" %% "scalacheck-1-17" % "3.2.18.0" % Test
  val scalaUri = "com.indoorvivants" %% "scala-uri" % "4.2.0"
  val seleniumJava = "org.seleniumhq.selenium" % "selenium-java" % "4.8.1"
  val slf4jExt = "org.slf4j" % "slf4j-ext" % "2.0.17"
  val jerseyCore = "com.sun.jersey" % "jersey-core" % jerseyVersion
  val jerseyClient = "com.sun.jersey" % "jersey-client" % jerseyVersion
  val w3cSac = "org.w3c.css" % "sac" % "1.3"
  val libPhoneNumber = "com.googlecode.libphonenumber" % "libphonenumber" % "8.13.55"
  val pekkoVersion = "1.1.3"
  val pekkoActor = "org.apache.pekko" %% "pekko-actor" % pekkoVersion
  val pekkoStream = "org.apache.pekko" %% "pekko-stream" % pekkoVersion
  val pekkoSlf4j = "org.apache.pekko" %% "pekko-slf4j" % pekkoVersion
  val pekkoSerializationJackson = "org.apache.pekko" %% "pekko-serialization-jackson" % pekkoVersion
  val pekkoActorTyped = "org.apache.pekko" %% "pekko-actor-typed" % pekkoVersion

  val logstash = ("net.logstash.logback" % "logstash-logback-encoder" % "8.0")
    .excludeAll(ExclusionRule("com.fasterxml.jackson.core")) // Avoid conflicts with Play's Jackson dependency
  val janino = "org.codehaus.janino" % "janino" % "3.1.12"

  val targetingClient = "com.gu.targeting-client" %% "client-play-json-v30" % "1.1.9"
  val scanamo = "org.scanamo" %% "scanamo" % "3.0.0"
  val enumeratumPlayJson = "com.beachape" %% "enumeratum-play-json" % "1.8.2"
  val commercialShared = "com.gu" %% "commercial-shared" % "6.2.3"
  val playJson = "org.playframework" %% "play-json" % playJsonVersion
  val playJsonJoda = "org.playframework" %% "play-json-joda" % playJsonVersion
  val supportInternationalisation = "com.gu" %% "support-internationalisation" % "0.16"
  val capiAws = "com.gu" %% "content-api-client-aws" % "0.7.6"

  // Web jars
  val bootstrap = "org.webjars" % "bootstrap" % "5.3.3"
  val jquery = "org.webjars" % "jquery" % "3.7.1"
  val jqueryui = "org.webjars" % "jquery-ui" % "1.14.1"
  val lodash = "org.webjars.npm" % "lodash" % "4.17.21"
  val react = "org.webjars" % "react" % "16.5.2"
  val epoch = "org.webjars.npm" % "epoch-charting" % "0.8.4"
  val d3 = "org.webjars.npm" % "d3" % "7.9.0"

  /*
    The versions are currently set as they are because of:
    https://github.com/orgs/playframework/discussions/11222
   */
  val jacksonVersion = "2.17.3"
  val jacksonDatabindVersion = "2.17.3"
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
}
