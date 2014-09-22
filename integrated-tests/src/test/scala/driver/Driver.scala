package driver

import java.net.URL

import driver.Config._
import org.openqa.selenium.WebDriver
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.remote.{DesiredCapabilities, RemoteWebDriver}
import org.scalatest.selenium.WebBrowser
import org.scalatest.{BeforeAndAfterAll, Retries, Suite}

trait Driver extends Suite with WebBrowser with BeforeAndAfterAll with Retries {

  private val url: String = s"http://${stack.userName}:${stack.automateKey}@ondemand.saucelabs.com:80/wd/hub"

  private lazy val remoteBrowser = {
    val capabilities = DesiredCapabilities.firefox()

    // this makes the test name appear in the Saucelabs UI
    capabilities.setCapability("name", getClass.getSimpleName)
    new RemoteWebDriver(new URL(url), capabilities)
  }

  override def withFixture(test: NoArgTest) = {
    if (isRetryable(test))
      withRetry { super.withFixture(test) }
    else
      super.withFixture(test)
  }

  private lazy val localBrowser = new FirefoxDriver()

  protected implicit val driver: WebDriver = if (remoteMode) remoteBrowser else localBrowser

  override protected def afterAll(): Unit = quit()

  // helper methods for tests
  protected def theguardian(path: String) = s"$baseUrl$path?view=responsive&test=test#countmein"

  protected def $(selector: String): List[Element] = findAll(cssSelector(selector)).toList
  protected def first(selector: String): Element = $(selector).head
}



