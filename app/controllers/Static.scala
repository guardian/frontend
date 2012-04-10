package controllers

import java.util.Properties
import collection.JavaConversions._
import conf.Logging
import play.Play

object Static extends Logging {

  private lazy val staticMappingCache = loadStaticMappings
  private lazy val reverseMappingCache = loadReverseMappings

  def staticMappings = if (Play.isProd) staticMappingCache else loadStaticMappings
  def reverseMappings = if (Play.isProd) reverseMappingCache else loadReverseMappings

  private def loadStaticMappings = {
    val in = getClass.getClassLoader.getResourceAsStream("static-paths.properties")
    val props = new Properties
    props.load(in)
    in.close()
    props.stringPropertyNames.map{ key => (key -> props.getProperty(key)) } toMap
  }

  private def loadReverseMappings = staticMappings.map{ case (key, value) => (value, key) }

  //enables lookup on dev environments that do not have a static docroot
  def at(path: String, file: String) = Assets.at(path, reverseMappings(file))

  //todo these eventually point to a static docroot for non DEV environments
  def at(path: String) = "/assets/%s" format (staticMappings(path))

}


