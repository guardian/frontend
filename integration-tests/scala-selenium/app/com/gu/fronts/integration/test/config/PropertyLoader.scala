package com.gu.fronts.integration.test.config

import java.io.{ FileInputStream, InputStream }
import java.util.Properties
import org.apache.commons.logging.LogFactory
import org.apache.commons.io.IOUtils
/**
 * Loads properties from a fixed file but can be overriden by specifying the environment variable of value
 * {@link #PROP_FILE_PATH_ENV_KEY} which can be set by providing a VM arguments like:
 *
 * <pre>
 * -DTEST_PROPERTY_OVERRIDE_PATH=/home/shahin/local-config.properties
 * </pre>
 */
object PropertyLoader {

  private val LOG = LogFactory.getLog(getClass)

  private val DEFAULT_PROPERTIES_FILE = "resources/base.properties"

  val PROP_FILE_PATH_ENV_KEY = "TEST_PROPERTY_OVERRIDE_PATH"
  // prop names
  val SAUCELABS_REMOTEDRIVER_URL = "saucelabs.remotedriver.url";

  def getProperty(name: String): String = {
    val property = loadProperties().getProperty(name)
    LOG.info("Getting property by name/value: " + name + "/" + property)
    property
  }

  def loadProperties(): Properties = {
    val loadedProperties = new Properties()
    loadedProperties.load(getClass.getClassLoader.getResourceAsStream(DEFAULT_PROPERTIES_FILE))
    addOverridePropertiesIfExists(loadedProperties)
    loadedProperties
  }

  private def addOverridePropertiesIfExists(loadedProperties: Properties) {
    try {
      loadedProperties.putAll(loadOverrideProperties())
      LOG.info("Successfully loaded property override file")
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
      case e: Exception => throw new RuntimeException("Could not load property override file: " + propertyFilePath + " due to " + e.getMessage, e)
    } finally {
      IOUtils.closeQuietly(propertyStream)
    }
  }

  private def getOverridePropertyFilePath(): String = {
    System.getProperty(PROP_FILE_PATH_ENV_KEY)
  }
}
