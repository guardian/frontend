package com.gu.integration.test.config

import com.gu.automation.support.Config
import com.gu.automation.support.TestLogging

object PropertyLoader extends TestLogging {

  //property keys
  val SauceLabsUrl = "sauceLabsUrl"
  val Browser = "browser"
  val BrowserVersion = "browserVersion"
  val BaseUrl = "baseUrl"

  def getProperty(name: String): String = {
    Config().getUserValue(name)
  }
}
