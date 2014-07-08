package com.gu.fronts.integration.test.config

import java.net.URL
import java.util.concurrent.TimeUnit.SECONDS

import org.apache.commons.lang3.StringUtils.isNotBlank
import org.openqa.selenium.Dimension
import org.openqa.selenium.Point
import org.openqa.selenium.WebDriver
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.ie.InternetExplorerDriver
import org.openqa.selenium.remote.DesiredCapabilities
import org.openqa.selenium.remote.RemoteWebDriver

import com.gu.fronts.integration.test.config.PropertyLoader.BROWSER
import com.gu.fronts.integration.test.config.PropertyLoader.BROWSER_VERSION
import com.gu.fronts.integration.test.config.PropertyLoader.SAUCELABS_REMOTEDRIVER_URL
import com.gu.fronts.integration.test.config.PropertyLoader.getProperty

object WebdriverFactory {

  //  def getWebDriver(testCaseName: String): WebDriver = {
  //    val capabilities = initDesiredCapabilities
  //    capabilities.setCapability("version", getProperty(BROWSER_VERSION))
  //    if (isNotBlank(testCaseName)) {
  //      capabilities.setCapability("name", testCaseName)
  //    }
  //    var driver: WebDriver = null
  //    if (isNotBlank(getProperty(SAUCELABS_REMOTEDRIVER_URL))) {
  //      driver = new RemoteWebDriver(new URL(getProperty(SAUCELABS_REMOTEDRIVER_URL)), capabilities)
  //    } else {
  //      driver = 
  //    }
  //    setGlobalWebdriverConf(driver)
  //  }

  def createWebDriver(testCaseName: String): WebDriver = {
    var driver: WebDriver = null
    var capabilities: DesiredCapabilities = null
    getProperty(BROWSER) match {
      case "firefox" =>
        capabilities = initDesiredCapabilities(testCaseName, DesiredCapabilities.firefox())
        driver = new FirefoxDriver(capabilities)
      case "chrome" =>
        capabilities = initDesiredCapabilities(testCaseName, DesiredCapabilities.chrome())
        driver = new ChromeDriver(capabilities)
      case "ie" =>
        capabilities = initDesiredCapabilities(testCaseName, DesiredCapabilities.internetExplorer())
        driver = new InternetExplorerDriver(capabilities)
      case default => throw new RuntimeException("Browser: [" + default + "] is not supported")
    }

    if (isNotBlank(getProperty(SAUCELABS_REMOTEDRIVER_URL))) {
      driver = new RemoteWebDriver(new URL(getProperty(SAUCELABS_REMOTEDRIVER_URL)), capabilities)
    }

    initWebDriver(driver)
  }

  //  private def initWebDriver: WebDriver = {
  //    if(StringUtils.isNotBlank(getProperty(SAUCELABS_REMOTEDRIVER_URL)){
  //      
  //    }
  //    getProperty(BROWSER) match {
  //      case "firefox" => return new FirefoxDriver
  //      case "chrome" => return DesiredCapabilities.chrome()
  //      case "ie" => return DesiredCapabilities.internetExplorer()
  //      case default => return DesiredCapabilities.firefox()
  //    }
  //  }

  private def initWebDriver(webDriver: WebDriver): WebDriver = {
    webDriver.manage().window().setPosition(new Point(0, 0))
    //needs to set a custom size because the auto size sometimes is not large enough to display certain elements
    webDriver.manage().window().setSize(new Dimension(1600, 1024))
    webDriver.manage().timeouts().implicitlyWait(10, SECONDS)
    webDriver
  }

  private def initDesiredCapabilities(testCaseName: String, capabilities: DesiredCapabilities): DesiredCapabilities = {
    capabilities.setCapability("version", getProperty(BROWSER_VERSION))
    if (isNotBlank(testCaseName)) {
      capabilities.setCapability("name", testCaseName)
    }
    return capabilities
  }
}
