package com.gu

import scala.io.Source
import java.io.FileWriter
import sbt._
import Keys._

object SbtGruntPlugin extends Plugin {

  val dateStampCache: File = {
    val t = IO.createTemporaryDirectory
    t.mkdirs()
    t.mkdir()
    t
  }

  private def runGrunt(task: String) = {
    val cmd = "grunt " + task
    cmd !
  }

  // Grunt command

  def gruntCommand = {
    Command.single("grunt") { (state: State, task: String) =>
      runGrunt(task)

      state
    }
  }

  // Grunt task

  def gruntTask(taskName: String) = streams map { (s: TaskStreams) =>
      val retval = runGrunt(taskName)
      if (retval != 0) {
        throw new Exception("Grunt task %s failed".format(taskName))
      }
  }

  def gruntTask(taskName: String, filesToCheck: SettingKey[PathFinder]) = (streams, filesToCheck) map { (s: TaskStreams, finder: PathFinder) =>

    val lastUpdated = dateStampCache / taskName

    if (!lastUpdated.exists()) {
      lastUpdated.createNewFile()
      writeCacheFile(lastUpdated, 0, 0)
    }

    val (lastSize, lastUpdateTime) = readLastCache(lastUpdated)

    val files = finder.get
    val newestSource = if (files.isEmpty) Long.MaxValue else files.map(_.lastModified).max
    val newestSize = files.size

    if (lastSize != newestSize || lastUpdateTime < newestSource) {
      val retval = runGrunt(taskName)
      if (retval != 0) {
        throw new Exception("Grunt task %s failed".format(taskName))
      }
      writeCacheFile(lastUpdated, newestSize, newestSource)
    } else {
      s.log.debug("No need to run grunt task: " + taskName)
    }
  }


  // Expose plugin
  override lazy val settings = Seq(
    commands += gruntCommand,
    clean ~= { unit => dateStampCache.listFiles.foreach(_.delete()) }
  )

  private def readLastCache(lastUpdated: File): (Long, Long) = {
    val fileLines = Source.fromFile(lastUpdated).getLines.toSeq.take(2)
    val lastSize = fileLines(0).toLong
    val lastUpdateTime = fileLines(1).toLong
    (lastSize, lastUpdateTime)
  }

  private def writeCacheFile(lastUpdated: File, newestSize: Int, newestSource: Long) {
    val writer = new FileWriter(lastUpdated)
    writer.write(newestSize + "\n" + newestSource)
    writer.close()
  }
}