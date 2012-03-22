import AssemblyKeys._
import java.io.File

organization := "com.gu"

resolvers += "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases"

// Development Settings

seq(scalariformSettings: _*)

// Compilation Settings

scalaVersion := "2.9.1"

maxErrors := 20

javacOptions ++= Seq("-source", "1.6", "-target", "1.6", "-encoding", "utf8")

scalacOptions ++= Seq("-unchecked", "-optimise", "-deprecation", "-Xcheckinit", "-encoding", "utf8")

seq(assemblySettings: _*)

jarName in assembly := "frontend-article.jar"

mainClass in assembly := Some("play.core.server.NettyServer")

// The definition of packageArtifact is inside FrontendArticle build file
assembly ~= packageArtifact

//these files cause duplicate exceptions - we still need to sort out logger though
excludedFiles in assembly := { (base: Seq[File]) =>
    (
        (base / "logger.xml") +++
        (base / "META-INF" / "MANIFEST.MF")
    ).get
}