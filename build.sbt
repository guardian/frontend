organization := "com.gu"



// Development Settings

seq(scalariformSettings: _*)



// Compilation Settings

scalaVersion := "2.9.1"

maxErrors := 20

javacOptions ++= Seq("-source", "1.6", "-target", "1.6", "-encoding", "utf8")

scalacOptions ++= Seq("-unchecked", "-optimise", "-deprecation", "-Xcheckinit", "-encoding", "utf8")
