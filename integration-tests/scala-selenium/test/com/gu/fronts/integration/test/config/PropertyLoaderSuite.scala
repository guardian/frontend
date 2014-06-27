package com.gu.fronts.integration.test.config

import org.scalatest.BeforeAndAfter
import org.scalatest.FunSuite
import org.scalatest.Ignore
import org.scalatest.Matchers

//Setting and clearing the property will interfere with other tests which are loading properties from override file
//hence why this is tagged as ignore
@Ignore
class PropertyLoaderSuite extends FunSuite with BeforeAndAfter with Matchers {

  before {
    System.setProperty(PropertyLoader.PROP_FILE_PATH_ENV_KEY, "test/resources/test-override.properties")
  }

  after {
    System.clearProperty(PropertyLoader.PROP_FILE_PATH_ENV_KEY)
  }

  test("should load property from base property file") {
    PropertyLoader.getProperty("fronts.base.url") should be("http://www.theguardian.com")
  }

  test("should load property from override property file") {
    PropertyLoader.getProperty("saucelabs.remotedriver.url") should be("overriden")
  }
}