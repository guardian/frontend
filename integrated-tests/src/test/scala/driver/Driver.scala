package driver

import java.net.URL

import org.openqa.selenium.WebDriver
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.remote.{DesiredCapabilities, RemoteWebDriver}
import org.scalatest.selenium.WebBrowser
import org.scalatest.{BeforeAndAfterAll, Suite}
import Config._


trait Driver extends Suite with WebBrowser with BeforeAndAfterAll {


  implicit private val url: String = s"http://${stack.userName}:${stack.automateKey}@ondemand.saucelabs.com:80/wd/hub"

  lazy val remoteBrowser = new RemoteWebDriver(new URL(url), DesiredCapabilities.chrome())
  lazy val localBroswer = new FirefoxDriver()

  implicit val driver: WebDriver =  if (remoteMode) remoteBrowser else localBroswer

  override protected def afterAll(): Unit = quit()

  // helper methods for tests
  def theguardian(path: String) = s"$baseUrl$path?view=responsive"
  def $(selector: String): List[Element] = findAll(cssSelector(selector)).toList
  def first(selector: String): Element = $(selector).head

}


