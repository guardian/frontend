package com.gu.fronts.integration.test.config

import java.io.FileInputStream
import java.io.InputStream
import java.util.Properties

import org.apache.commons.io.IOUtils
import org.apache.commons.logging.LogFactory

object PropertyLoader {

  private val LOG = LogFactory.getLog(getClass)

  private val DEFAULT_PROPERTIES_FILE = "resources/base.properties"

  val PROP_FILE_PATH_ENV_KEY = "env.test-property-file"

  def getProperty(name: String): String = loadProperties().getProperty(name)

  def loadProperties(): Properties = {
    val loadedProperties = new Properties()
    loadedProperties.load(getClass.getClassLoader.getResourceAsStream(DEFAULT_PROPERTIES_FILE))
    addOverridePropertiesIfExists(loadedProperties)
    loadedProperties
  }

  private def addOverridePropertiesIfExists(loadedProperties: Properties) {
    try {
      loadedProperties.putAll(loadOverrideProperties())
    } catch {
      case e: Exception => LOG.info("Could not load override properties so will use the base properties only. Reason:  " + e.getMessage)
    }
  }

  private def loadOverrideProperties(): Properties = {
    val propertyFilePath = getOverridePropertyFilePath
    var propertyStream: InputStream = null
    try {
      propertyStream = new FileInputStream(propertyFilePath)
      val overrideProperties = new Properties()
      overrideProperties.load(propertyStream)
      overrideProperties
    } catch {
      case e: Exception => throw new RuntimeException("Could not load override property file: " + propertyFilePath, e)
    } finally {
      IOUtils.closeQuietly(propertyStream)
    }
  }

  private def getOverridePropertyFilePath(): String = {
    System.getProperty(PROP_FILE_PATH_ENV_KEY)
  }

}