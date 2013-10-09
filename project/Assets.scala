package com.gu

import sbt._

class Assets(private val assets: Seq[Asset]) {
  def toText: String = (assets map { _.toText }).sorted mkString "\n"
  def toMD5Remap: Map[File, File] = (assets map { _.toMD5Remap }).toMap
}

object Assets {
  def fromFiles(base: File, files: Seq[File]): Assets = {
    new Assets(files filter { !_.isDirectory } map { Asset(_, base) })
  }
}

case class Asset(absolute: File, base: File) {
  lazy val debased: String = absolute.rebase(base).toString

  def debasedWithMD5Chunk: String = {
    val Path = """(.*)\.([^\.]*)$""".r
    val Path(file, suffix) = debased

    // don't hash head css
    file match {
      case "stylesheets/head.min" => "%s.%s".format(file, suffix)
      case _ => "%s.%s.%s".format(file, absolute.md5Hex, suffix)
    }
  }

  def toText: String = debased + "=" + debasedWithMD5Chunk
  def toMD5Remap: (File, File) = (absolute, base / debasedWithMD5Chunk)
}
