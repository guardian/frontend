package com.gu.fronts.integration.test.config

import com.gu.automation.support.Config
import com.gu.automation.support.TestLogging

object PropertyLoader extends TestLogging {

  //property keys
  val SAUCELABS_REMOTEDRIVER_URL = "sauceLabsUrl"
  val BROWSER = "browser"
  val BROWSER_VERSION = "browserVersion"
  val BASE_URL = "baseUrl"

  def getProperty(name: String): String = {
    Config().getUserValue(name)
  }
}
