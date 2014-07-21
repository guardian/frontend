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
import com.gu.automation.support.TestLogging
import org.openqa.selenium.Platform

object WebdriverInitialiser extends TestLogging {

  def initWebDriver(webDriver: WebDriver): WebDriver = {
    webDriver.manage().timeouts().implicitlyWait(10, SECONDS)
    webDriver
  }
}
