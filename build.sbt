name := "frontend-common"

organization := "com.gu"

version := "1.4-SNAPSHOT"

resolvers ++= Seq(
    "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
    "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/"
)

libraryDependencies ++= Seq(
    "com.gu.openplatform" %% "content-api-client" % "1.13" % "provided",
    "play" %% "play" % "2.0" % "provided",
    "org.scalatest" %% "scalatest" % "1.7.1" % "test"
)

seq(scalariformSettings: _*)


// no javadoc
publishArtifact in (Compile, packageDoc) := false

publishTo <<= (version) { version: String =>
    val publishType = if (version.endsWith("SNAPSHOT")) "snapshots" else "releases"
    Some(
        Resolver.file(
            "guardian github " + publishType,
            file(System.getProperty("user.home") + "/guardian.github.com/maven/repo-" + publishType)
        )
    )
}