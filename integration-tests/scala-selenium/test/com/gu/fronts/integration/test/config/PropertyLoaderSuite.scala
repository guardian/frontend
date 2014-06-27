package com.gu.fronts.integration.test.config

import org.scalatest.FunSuite
import org.scalatest.BeforeAndAfter
import org.scalatest.Matchers

class PropertyLoaderSuite extends FunSuite with BeforeAndAfter with Matchers{
  
  before {
    System.setProperty(PropertyLoader.PROP_FILE_PATH_ENV_KEY, "test/resources/test-override.properties")
  }
  
  after{
     System.clearProperty(PropertyLoader.PROP_FILE_PATH_ENV_KEY)
  }

  test("should load property from base property file") {
    PropertyLoader.getProperty("fronts.base.url") should be("http://www.theguardian.com")
  }
  
  test("should load property from override property file") {
    PropertyLoader.getProperty("saucelabs.remotedriver.url") should be("overriden")
  }
}