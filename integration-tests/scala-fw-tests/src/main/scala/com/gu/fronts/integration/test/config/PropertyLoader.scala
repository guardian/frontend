package com.gu.fronts.integration.test.config

import java.io.{FileInputStream, InputStream}
import java.util.Properties

import com.gu.automation.support.TestLogging
import org.apache.commons.io.IOUtils

object PropertyLoader extends TestLogging {

  val DEFAULT_PROPERTIES_FILE = "base.properties"

  val PROP_FILE_PATH_ENV_KEY = "TEST_PROPERTY_OVERRIDE_PATH"

  val SAUCELABS_REMOTEDRIVER_URL = "saucelabs.remotedriver.url"

  def getProperty(name: String): String = {
    val property = loadProperties(DEFAULT_PROPERTIES_FILE).getProperty(name)
    logger.info("Getting property by name/value: " + name + "/" + property)
    property
  }

  private def loadProperties(defaultPropertiesFile: String): Properties = {
    val loadedProperties = new Properties()
    try {
      loadedProperties.load(getClass.getClassLoader.getResourceAsStream(defaultPropertiesFile))
    } catch {
      case e: Exception => loadedProperties.load(getClass.getClassLoader.getResourceAsStream("resources/" + defaultPropertiesFile))
    }
    addOverridePropertiesIfExists(loadedProperties)
    addSystemOverridePropertiesIfExists(loadedProperties)
    loadedProperties
  }

  private def addOverridePropertiesIfExists(loadedProperties: Properties) {
    try {
      loadedProperties.putAll(loadOverrideProperties())
      logger.info("Successfully loaded property override file")
    } catch {
      case e: Exception => logger.info("Could not load override properties so will use the base properties only. Reason:  " + e.getMessage)
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
      case e: Exception => throw new RuntimeException("Could not load property override file: " + propertyFilePath + " due to " + e.getMessage, e)
    } finally {
      IOUtils.closeQuietly(propertyStream)
    }
  }

  private def getOverridePropertyFilePath(): String = {
    System.getProperty(PROP_FILE_PATH_ENV_KEY)
  }

  private def addSystemOverridePropertiesIfExists(loadedProperties: Properties) {
    loadedProperties.putAll(System.getProperties)
  }
}
