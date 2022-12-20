// Additional information on initialization
logLevel := Level.Warn

// Dependencies used by the VersionInfo plugin
libraryDependencies ++= Seq(
  "joda-time" % "joda-time" % "2.3",
  "org.joda" % "joda-convert" % "1.7",
)

resolvers ++= Resolver.sonatypeOssRepos("releases") ++ Seq(
  Classpaths.typesafeReleases,
  Resolver.typesafeRepo("releases"),
)

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.8.8")

addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "1.3.1")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.3.3")

addSbtPlugin("com.gu" % "sbt-riffraff-artifact" % "1.1.18")

addSbtPlugin("com.typesafe.sbt" % "sbt-git" % "0.9.3")

addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.4.0")

addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.0")

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.11.0")

/*
   Without setting VersionScheme.Always here on `scala-xml`, sbt 1.8.0 will raise fatal 'version conflict' errors when
   used with sbt plugins like `sbt-native-packager`, which currently use sort-of-incompatible versions of the `scala-xml`
   library. sbt 1.8.0 has upgraded to Scala 2.12.17, which has itself upgraded to `scala-xml` 2.1.0
   (see https://github.com/sbt/sbt/releases/tag/v1.8.0), but `sbt-native-packager` is currently using `scala-xml` 1.1.1,
    and the `scala-xml` library declares that it uses specifically 'early-semver' version compatibility (see
    https://www.scala-lang.org/blog/2021/02/16/preventing-version-conflicts-with-versionscheme.html#versionscheme-librarydependencyschemes-and-sbt-150 ),
    meaning that for version x.y.z, `x` & `y` *must match exactly* for versions to be considered compatible by sbt.

    By setting VersionScheme.Always here on `scala-xml`, we're overriding its declared version-compatability scheme,
    choosing to tolerate the risk of binary incompatibility. We consider this to be safe because when set under
    `projects/` (ie *not* in `build.sbt` itself) it only affects the compilation of build.sbt, not of the application
    build itself. Once the build has succeeded, there is no further risk (ie of a runtime exception due to clashing
    versions of `scala-xml`).
 */
libraryDependencySchemes += "org.scala-lang.modules" %% "scala-xml" % VersionScheme.Always
