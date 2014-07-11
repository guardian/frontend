package com.gu.integration.test.config

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
import com.gu.integration.test.config.PropertyLoader._
import com.gu.integration.test.config.PropertyLoader.getProperty
import com.gu.automation.support.TestLogging

object WebdriverFactory extends TestLogging {

  def createWebDriver(testCaseName: String): WebDriver = {
    val (webDriver, capabilities) = getProperty(Browser) match {
      case "firefox" =>
        val capabilities = initDesiredCapabilities(testCaseName, DesiredCapabilities.firefox())
        (new FirefoxDriver(capabilities), capabilities)
      case "chrome" =>
        val capabilities = initDesiredCapabilities(testCaseName, DesiredCapabilities.chrome())
        (new ChromeDriver(capabilities), capabilities)
      case "ie" =>
        val capabilities = initDesiredCapabilities(testCaseName, DesiredCapabilities.internetExplorer())
        (new InternetExplorerDriver(capabilities), capabilities)
      case default => throw new RuntimeException(s"Browser: [$default] is not supported")
    }

    initWebDriver(overrideSauceLabsDriver(capabilities, webDriver))
  }

  private def initWebDriver(webDriver: WebDriver): WebDriver = {
    webDriver.manage().window().setPosition(new Point(0, 0))
    //needs to set a custom size because the auto size sometimes is not large enough to display certain elements
    webDriver.manage().window().setSize(new Dimension(1600, 1024))
    webDriver.manage().timeouts().implicitlyWait(10, SECONDS)
    webDriver
  }

  private def initDesiredCapabilities(testCaseName: String, capabilities: DesiredCapabilities): DesiredCapabilities = {
    capabilities.setCapability("version", getProperty(BrowserVersion))
    if (isNotBlank(testCaseName)) {
      capabilities.setCapability("name", testCaseName)
    }
    return capabilities
  }
  
  private def overrideSauceLabsDriver(capabilities: DesiredCapabilities, driver: => WebDriver): WebDriver = {
    val sauceLabsUrl = getProperty(SauceLabsUrl)
    if (isNotBlank(sauceLabsUrl)) {
      new RemoteWebDriver(new URL(sauceLabsUrl), capabilities)
    } else driver
  }
}
