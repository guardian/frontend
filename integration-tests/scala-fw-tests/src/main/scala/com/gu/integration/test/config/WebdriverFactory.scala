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
  val Firefox = "firefox"
  val Chrome = "chrome"
  val Ie = "ie"

  def createWebDriver(testCaseName: String): WebDriver = {
    val sauceLabsUrl = getProperty(SauceLabsUrl)
    val browserName = getProperty(Browser)
    
    val capabilities = browserName match {
      case Firefox => initDesiredCapabilities(testCaseName, DesiredCapabilities.firefox())
      case Chrome => initDesiredCapabilities(testCaseName, DesiredCapabilities.chrome())
      case Ie => initDesiredCapabilities(testCaseName, DesiredCapabilities.internetExplorer())
      case unknown => throw new RuntimeException(s"Browser: [$unknown] is not supported")
    }
    
    val webDriver = if (isNotBlank(sauceLabsUrl)) {
      new RemoteWebDriver(new URL(sauceLabsUrl), capabilities)
    } else browserName match {
      case Firefox => new FirefoxDriver(capabilities)
      case Chrome => new ChromeDriver(capabilities)
      case Ie => new InternetExplorerDriver(capabilities)
    }

    initWebDriver(webDriver)
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
}
