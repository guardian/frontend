package com.gu.fronts.integration.test.config

import java.net.URL
import java.util.concurrent.TimeUnit.SECONDS

import com.gu.fronts.integration.test.config.PropertyLoader._
import org.apache.commons.lang3.StringUtils.isNotBlank
import org.openqa.selenium.{Dimension, Point, WebDriver}
import org.openqa.selenium.chrome.{ChromeDriver, ChromeOptions}
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.remote.{DesiredCapabilities, RemoteWebDriver}

object WebdriverFactory {

  val SAUCE_LABS_FIREFOX_VERSION = "30"

  val SAUCE_LABS_OS_VERSION = "Windows 7"

  def getDefaultWebDriver(): WebDriver = getFirefoxWebdriver

  def getFirefoxWebdriver(): WebDriver = {
    val desiredCap = DesiredCapabilities.firefox()
    desiredCap.setCapability("applicationCacheEnabled", false)
    setGlobalWebdriverConf(new FirefoxDriver(), desiredCap)
  }

  def getSauceLabsWebdriver(jobName: String): WebDriver = {
    val capabilities = DesiredCapabilities.firefox()
    capabilities.setCapability("version", SAUCE_LABS_FIREFOX_VERSION)
    capabilities.setCapability("platform", SAUCE_LABS_OS_VERSION)
    if (isNotBlank(jobName)) {
      capabilities.setCapability("name", jobName)
    }
    //TODO get from conf
    val driver = new RemoteWebDriver(new URL(getProperty(SAUCELABS_REMOTEDRIVER_URL)), capabilities)
    setGlobalWebdriverConf(driver, capabilities)
    driver
  }

  /**
   * only use if you have a chrome driver installed
   */
  def getChromeWebdriver(): WebDriver = {
    val options = new ChromeOptions()
    options.addArguments("--disable-application-cache")
    val webDriver = new ChromeDriver(options)
    setGlobalWebdriverConf(webDriver, new DesiredCapabilities())
  }

  private def setGlobalWebdriverConf(webDriver: WebDriver, desiredCap: DesiredCapabilities): WebDriver = {
    webDriver.manage().window().setPosition(new Point(0, 0))
    webDriver.manage().window().setSize(new Dimension(1600, 1024))
    webDriver.manage().timeouts().implicitlyWait(10, SECONDS)
    webDriver
  }
}
