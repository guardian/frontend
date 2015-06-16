package integration

import java.net.URL
import java.util.concurrent.TimeUnit

import akka.agent.Agent
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.remote.{DesiredCapabilities, RemoteWebDriver}
import org.openqa.selenium.{By, WebDriver, WebElement}
import org.scalatest._
import org.scalatestplus.play.BrowserFactory.UninitializedDriver

import scala.collection.JavaConversions._
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

trait SingleWebDriver extends SuiteMixin { this: Suite =>

  private lazy val webDriver = {

    def remoteWebDriver = {
      val capabilities = DesiredCapabilities.firefox()

      // this makes the test name appear in the Saucelabs UI
      val buildNumber = System.getProperty("build.number", "")
      capabilities.setCapability("name", s"Integrated Tests Suite $buildNumber")
      val domain = s"${Config.stack.userName}:${Config.stack.automateKey}@ondemand.saucelabs.com"
      val url = s"http://$domain:80/wd/hub"
      new RemoteWebDriver(new URL(url), capabilities)
    }

    def localWebDriver = new ChromeDriver()

    if (Config.remoteMode) remoteWebDriver
    else localWebDriver
  }

  abstract override def run(testName: Option[String], args: Args): Status = {
    val cleanup: Boolean => Unit = { _ => webDriver.quit() }
    try {
      val newConfigMap = args.configMap + ("webDriver" -> webDriver)
      val newArgs = args.copy(configMap = newConfigMap)
      val status = super.run(testName, newArgs)
      status.whenCompleted(cleanup)
      status
    } catch {
      case ex: Throwable =>
        cleanup(false)
        throw ex
    }
  }
}

trait SharedWebDriver extends SuiteMixin { this: Suite =>

  private val driverAgent = Agent[WebDriver](UninitializedDriver)

  protected def webDriver: WebDriver = driverAgent()

  abstract override def run(testName: Option[String], args: Args): Status = {
    args.configMap.getOptional[WebDriver]("webDriver") match {
      case Some(driver:WebDriver) => {
        Await.ready(driverAgent.alter(driver), 1.minute)
      }
      case None => throw new Exception("No shared web driver found")
    }
    super.run(testName, args)
  }

  protected def get(path: String) = {
    webDriver.get(s"${Config.baseUrl}$path?test=test#gu.prefs.switchOff=adverts&countmein&noads")
    webDriver.navigate().refresh()
  }

  protected def implicitlyWait(seconds: Int) = {
    webDriver.manage().timeouts().implicitlyWait(seconds, TimeUnit.SECONDS)
  }

  protected def $(selector: String): List[WebElement] = webDriver.findElements(By.cssSelector(selector)).toList

  protected def first(selector: String): WebElement = webDriver.findElement(By.cssSelector(selector))
}

class IntegratedTestsSuite extends Suites (
  new AdsTest,
  new MostPopularTest,
  new SslCertTest,
  new ProfileCommentsTest) with SingleWebDriver {
}
