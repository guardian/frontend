package com.gu.fronts.integration.test.config

import com.gu.fronts.integration.test.config.PropertyLoader.SAUCELABS_REMOTEDRIVER_URL
import com.gu.fronts.integration.test.config.PropertyLoader.getProperty
import java.util.concurrent.TimeUnit.SECONDS
import java.io.File
import java.io.IOException
import java.net.MalformedURLException
import java.net.URL
import org.apache.commons.io.FileUtils
import org.openqa.selenium.Dimension
import org.openqa.selenium.OutputType
import org.openqa.selenium.Point
import org.openqa.selenium.TakesScreenshot
import org.openqa.selenium.WebDriver
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.remote.DesiredCapabilities
import org.openqa.selenium.remote.RemoteWebDriver
import WebdriverFactory._

object WebdriverFactory {

  val SAUCE_LABS_FIREFOX_VERSION = "30"
  val SAUCE_LABS_OS_VERSION = "Windows 7"

  def getDefaultWebDriver(): WebDriver = getFirefoxWebdriver

  def getFirefoxWebdriver(): WebDriver = {
    val desiredCap = DesiredCapabilities.firefox()
    desiredCap.setCapability("applicationCacheEnabled", false)
    setGlobalWebdriverConf(new FirefoxDriver(), desiredCap)
  }

  def getSauceLabsWebdriver(): WebDriver = {
    val capabilities = DesiredCapabilities.firefox()
    capabilities.setCapability("version", SAUCE_LABS_FIREFOX_VERSION)
    capabilities.setCapability("platform", SAUCE_LABS_OS_VERSION)
    val sauceLabsUrl = getProperty(SAUCELABS_REMOTEDRIVER_URL)
    val driver = new RemoteWebDriver(new URL(sauceLabsUrl), capabilities)
    setGlobalWebdriverConf(driver, capabilities)
    driver
  }

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

  //experimental
  private def configureScreenshot(webDriver: WebDriver) {
    val scrFile = webDriver.asInstanceOf[TakesScreenshot].getScreenshotAs(OutputType.FILE)
    FileUtils.copyFile(scrFile, new File("/tmp/selenium_screenshot.png"))
  }
}