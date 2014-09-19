package driver

import java.net.URL

import driver.Config._
import org.openqa.selenium.WebDriver
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.remote.{DesiredCapabilities, RemoteWebDriver}
import org.scalatest.concurrent.Eventually
import org.scalatest.exceptions.TestFailedException
import org.scalatest.selenium.WebBrowser
import org.scalatest.time.{Seconds, Span}
import org.scalatest.{BeforeAndAfterAll, Suite}

trait Driver extends Suite with WebBrowser with BeforeAndAfterAll with Eventually {

  private val url: String = s"http://${stack.userName}:${stack.automateKey}@ondemand.saucelabs.com:80/wd/hub"

  private lazy val remoteBrowser = {
    val capabilities = DesiredCapabilities.firefox()

    // this makes the test name appear in the Saucelabs UI
    capabilities.setCapability("name", getClass.getSimpleName)
    new RemoteWebDriver(new URL(url), capabilities)
  }

  private lazy val localBrowser = new FirefoxDriver()

  protected implicit val driver: WebDriver = if (remoteMode) remoteBrowser else localBrowser

  implicit val patience: PatienceConfig = PatienceConfig(timeout = Span(20, Seconds), interval = Span(5, Seconds))

  override protected def afterAll(): Unit = quit()

  // helper methods for tests
  protected def theguardian(path: String) = s"$baseUrl$path?view=responsive&test=test#countmein"

  protected def $(selector: String): List[Element] = findAll(cssSelector(selector)).toList
  protected def first(selector: String): Element = $(selector).head

  // reloads the page and retries the test if it fails
  def retryPage[T](test : => T) = eventually(
    try test catch { case e: TestFailedException =>
      reloadPage()
      throw e
    }
  )
}



