// Additional information on initialization
logLevel := Level.Warn

/*
    The versions are currently set as they are because of:
    https://github.com/orgs/playframework/discussions/11222
   */
val jacksonVersion = "2.17.2"
val jacksonDatabindVersion = "2.17.2"
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


// Dependencies used by the VersionInfo plugin
libraryDependencies ++= Seq(
  "joda-time" % "joda-time" % "2.12.7",
  "org.joda" % "joda-convert" % "2.2.3",
) ++ jackson

resolvers ++= Resolver.sonatypeOssRepos("releases")

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.5")

addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.10.0")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.6.4")

addSbtPlugin("com.github.sbt" % "sbt-git" % "2.0.1")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.5.2")

addDependencyTreePlugin

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.12.0")
