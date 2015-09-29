package com.gu.versioninfo

import java.net.InetAddress
import org.joda.time.{DateTimeZone, DateTime}
import sbt._
import Keys._
import org.eclipse.jgit.storage.file.FileRepositoryBuilder

object VersionInfo extends Plugin {

  val branch = SettingKey[String]("version-branch")
  val buildNumber = SettingKey[String]("version-build-number")
  val vcsNumber = SettingKey[String]("version-vcs-number")

  private def isValidRepo(repo: java.io.File) = {
    val gitRepo = new FileRepositoryBuilder().findGitDir(repo)
    val hasExpectedRemote = gitRepo.build.getConfig.getString("remote", "origin", "url") == "git@github.com:guardian/frontend.git"
    gitRepo.build.close()
    hasExpectedRemote
  }

  override val settings = Seq(
    buildNumber := System.getenv().getOrDefault("BUILD_NUMBER", "DEV"),
    branch <<= baseDirectory( baseDir => {
      if (isValidRepo(baseDir)) {
        val gitRepo = new FileRepositoryBuilder().findGitDir(baseDir)
        val branchName = gitRepo.build.getBranch
        gitRepo.build.close()
        branchName
      } else {
        "DEV"
      }
    }),
    vcsNumber <<= baseDirectory( baseDir => {
      if (isValidRepo(baseDir)) {
        val gitRepo = new FileRepositoryBuilder().findGitDir(baseDir)
        val commitHash = gitRepo.build.resolve("HEAD").getName
        gitRepo.build.close()
        commitHash
      } else {
        "DEV"
      }
    }),
    resourceGenerators in Compile <+= (resourceManaged in Compile, branch, buildNumber, vcsNumber, streams) map buildFile
  )

  def buildFile(outDir: File, branch: String, buildNum: String, vcsNum: String, s: TaskStreams) = {
    val versionInfo = Map(
      "Revision" -> vcsNum,
      "Branch" -> branch,
      "Build" -> buildNum.replace("\"", "").trim,
      "Date" -> new DateTime(DateTimeZone.UTC).toString(),
      "Built-By" -> System.getProperty("user.name", "<unknown>"),
      "Built-On" -> InetAddress.getLocalHost.getHostName)

    val versionFileContents = (versionInfo map { case (x, y) => x + ": " + y }).toList.sorted

    val versionFile = outDir / "version.txt"
    s.log.debug("Writing to " + versionFile + ":\n   " + versionFileContents.mkString("\n   "))

    IO.write(versionFile, versionFileContents mkString "\n")

    Seq(versionFile)
  }
}