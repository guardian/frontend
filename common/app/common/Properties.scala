package common

import org.apache.commons.io.IOUtils
import java.io.{FileInputStream, File, InputStream}
import scala.collection.JavaConversions._
import java.net.URL
import implicits.AutomaticResourceManagement
import scala.language.reflectiveCalls

object Properties extends AutomaticResourceManagement {
  def apply(is: InputStream): Map[String, String] = {
    val properties = new java.util.Properties()
    withCloseable(is) { properties load _ }
    properties.toMap
  }

  def apply(text: String): Map[String, String] = apply(IOUtils.toInputStream(text))
  def apply(file: File): Map[String, String] = apply(new FileInputStream(file))
  def apply(url: URL): Map[String, String] = apply(url.openStream)
}