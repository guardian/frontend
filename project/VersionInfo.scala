package com.gu.versioninfo

import java.net.InetAddress
import java.util.Date
import sbt._
import Keys._
import java.lang.System

object VersionInfo extends Plugin {

  implicit def string2Dequote(s: String) = new {
    lazy val dequote = s.replace("\"", "")
  }

  val branch = SettingKey[String]("version-branch")
  val buildNumber = SettingKey[String]("version-build-number")
  val vcsNumber = SettingKey[String]("version-vcs-number")

  override val settings = Seq(
    buildNumber := System.getProperty("build.number", "DEV"),
    branch := System.getProperty("build.vcs.branch", "DEV"),
    vcsNumber := System.getProperty("build.vcs.number", "DEV"),
    resourceGenerators in Compile <+= (resourceManaged in Compile, branch, buildNumber, vcsNumber, streams) map buildFile
  )

  def buildFile(outDir: File, branch: String, buildNum: String, vcsNum: String, s: TaskStreams) = {
    val versionInfo = Map(
      "Revision" -> vcsNum.dequote.trim,
      "Branch" -> branch.dequote.trim,
      "Build" -> buildNum.dequote.trim,
      "Date" -> new Date().toString,
      "Built-By" -> System.getProperty("user.name", "<unknown>"),
      "Built-On" -> InetAddress.getLocalHost.getHostName)

    val versionFileContents = (versionInfo map { case (x, y) => x + ": " + y }).toList.sorted

    val versionFile = outDir / "version.txt"
    s.log.debug("Writing to " + versionFile + ":\n   " + versionFileContents.mkString("\n   "))

    IO.write(versionFile, versionFileContents mkString "\n")

    Seq(versionFile)
  }
}