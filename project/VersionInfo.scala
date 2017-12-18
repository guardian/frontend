package com.gu.versioninfo

import java.net.InetAddress
import org.joda.time.{DateTimeZone, DateTime}
import sbt._
import Keys._
import org.eclipse.jgit.storage.file.FileRepositoryBuilder

object VersionInfo extends AutoPlugin {

  val branch = SettingKey[String]("version-branch")
  val buildNumber = SettingKey[String]("version-build-number")
  val vcsNumber = SettingKey[String]("version-vcs-number")

  private def getRepo(repo: java.io.File) = {
    try {
      val gitRepo = new FileRepositoryBuilder().findGitDir(repo)
      if (gitRepo.build.getConfig.getString("remote", "origin", "url") == "git@github.com:guardian/frontend.git") {
        Some(gitRepo)
      } else {
        None
      }
    } catch {
      case _: Throwable => None
    }
  }

  override val projectSettings = Seq(
    buildNumber := System.getenv().getOrDefault("BUILD_NUMBER", "DEV"),
    branch := baseDirectory( baseDir => {
      getRepo(baseDir).map( gitRepo => {
        val branchName = gitRepo.build.getBranch
        gitRepo.build.close()
        branchName
      }).getOrElse("DEV")
    }).value,
    vcsNumber := baseDirectory( baseDir => {
      getRepo(baseDir).map( gitRepo => {
        val commitHash = gitRepo.build.resolve("HEAD").getName
        gitRepo.build.close()
        commitHash
      }).getOrElse("DEV")
    }).value,
    resourceGenerators in Compile += Def.task {
      buildFile(
        (resourceManaged in Compile).value,
        branch.value,
        buildNumber.value,
        vcsNumber.value,
        streams.value
      )
    }
  )

  def buildFile(outDir: File, branch: String, buildNum: String, vcsNum: String, s: TaskStreams): Seq[File] = {
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
