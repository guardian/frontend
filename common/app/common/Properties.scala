package common

import java.io.{File, FileInputStream, InputStream}

import scala.jdk.CollectionConverters._
import java.net.URL
import java.nio.charset.Charset

import implicits.AutomaticResourceManagement
import org.apache.commons.io.IOUtils

import scala.language.reflectiveCalls

object Properties extends AutomaticResourceManagement {
  def apply(is: InputStream): Map[String, String] = {
    val properties = new java.util.Properties()
    withCloseable(is) { properties load _ }
    properties.asScala.toMap
  }

  def apply(text: String): Map[String, String] = apply(IOUtils.toInputStream(text, Charset.defaultCharset()))
  def apply(file: File): Map[String, String] = apply(new FileInputStream(file))
  def apply(url: URL): Map[String, String] = apply(url.openStream)
}
