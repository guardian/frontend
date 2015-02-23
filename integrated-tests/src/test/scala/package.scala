package integration

import java.net.URL
import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import akka.agent.Agent
import org.openqa.selenium.{WebDriver, WebElement, By}
import org.openqa.selenium.remote.{RemoteWebDriver, DesiredCapabilities}
import org.scalatest._
import org.scalatestplus.play.BrowserFactory.UninitializedDriver
import scala.collection.JavaConversions._

trait SingleWebDriver extends SuiteMixin { this: Suite =>

  private lazy val url: String = s"http://${Config.stack.userName}:${Config.stack.automateKey}@ondemand.saucelabs.com:80/wd/hub"

  private lazy val webDriver = {
    val capabilities = DesiredCapabilities.firefox()

    // this makes the test name appear in the Saucelabs UI
    val buildNumber = System.getProperty("build.number", "")
    capabilities.setCapability("name", s"Integrated Tests Suite $buildNumber")
    new RemoteWebDriver(new URL(url), capabilities)
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
    webDriver.manage().timeouts().implicitlyWait(seconds, TimeUnit.SECONDS);
  }

  protected def $(selector: String): List[WebElement] = webDriver.findElements(By.cssSelector(selector)).toList

  protected def first(selector: String): WebElement = webDriver.findElement(By.cssSelector(selector))
}

class IntegratedTestsSuite extends Suites (
  new AdsTest,
  new MostPopularTest,
  new SslCertTest,
  new ShowMoreTest,
  new FootballLiveBlogComponentsTest,
  new MatchReportComponentsTest,
  new ProfileCommentsTest) with SingleWebDriver {
}
