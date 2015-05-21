package commercial.integration

import java.io.{File, FileInputStream}
import java.net.URL
import java.util.Properties
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

class AdsTest extends FlatSpec with Matchers with SharedWebDriver with SingleWebDriver {

  "Ads" should "display on the sport front" in {

    webDriver.get(theguardianWithAds("/uk/sport"))
    webDriver.navigate().refresh()

    // This is an essential sleep, because the implicitlyWait isn't sufficient to ensure that
    // the js application has completed, since the dfp-ad classes exist on page load.
    Thread.sleep(10000)
    implicitlyWait(20)

    withClue("Should display top banner ad") {
      $("#dfp-ad--top-above-nav > *").size should be > 0
    }

    withClue("Should display two MPUs") {
      $("#dfp-ad--inline1 > *").size should be > 0
      $("#dfp-ad--inline2 > *").size should be > 0
    }
  }

  protected def theguardianWithAds(path: String) =
    s"${AdsTest.baseUrl}$path?test=test#gu.prefs.switchOn=adverts"
}

object AdsTest {

  private val userConfig = new File(s"${System.getProperty("user.home")}/.gu/frontend.properties")
  private val machineConfig = new File(s"/etc/gu/frontend.properties")

  private def someFileOrNone(file: File) = if (file.exists) Some(file) else None

  private val configFiles: Seq[File] = Seq(
    someFileOrNone(userConfig),
    someFileOrNone(machineConfig)
  ).flatten

  private val properties = {
    val props = new Properties()
    configFiles.foreach(file => props.load(new FileInputStream(file)))
    props
  }

  private def mandatoryProperty(key: String) = Option(properties.getProperty(key)).getOrElse(
    throw new RuntimeException(s"property not found $key"))

  private def optionalProperty(key: String) =
    Option(System.getProperty(s"ng.$key"))
      .orElse(Option(properties.getProperty(key)))

  val baseUrl = optionalProperty("tests.baseUrl").getOrElse("http://www.theguardian.com")

  object stack {
    lazy val userName = mandatoryProperty("stack.userName")
    lazy val automateKey = mandatoryProperty("stack.automateKey")
  }

  val runTestsRemotely = optionalProperty("tests.mode").contains("remote")
}

trait SharedWebDriver extends SuiteMixin {
  this: Suite =>

  private val driverAgent = Agent[WebDriver](UninitializedDriver)

  protected def webDriver: WebDriver = driverAgent()

  abstract override def run(testName: Option[String], args: Args): Status = {
    args.configMap.getOptional[WebDriver]("webDriver") match {
      case Some(driver: WebDriver) => Await.ready(driverAgent.alter(driver), 1.minute)
      case None => throw new Exception("No shared web driver found")
    }
    super.run(testName, args)
  }

  protected def implicitlyWait(seconds: Int) = {
    webDriver.manage().timeouts().implicitlyWait(seconds, TimeUnit.SECONDS)
  }

  protected def $(selector: String): List[WebElement] =
    webDriver.findElements(By.cssSelector(selector)).toList

  protected def first(selector: String): WebElement =
    webDriver.findElement(By.cssSelector(selector))
}

trait SingleWebDriver extends SuiteMixin {
  this: Suite =>

  private lazy val webDriver = {

    def remoteWebDriver = {
      val capabilities = DesiredCapabilities.firefox()

      // this makes the test name appear in the Saucelabs UI
      val buildNumber = System.getProperty("build.number", "")
      capabilities.setCapability("name", s"Integrated Tests Suite $buildNumber")
      val domain = s"${AdsTest.stack.userName}:${AdsTest.stack.automateKey}@ondemand.saucelabs.com"
      val url = s"http://$domain:80/wd/hub"
      new RemoteWebDriver(new URL(url), capabilities)
    }

    def localWebDriver = new ChromeDriver()

    if (AdsTest.runTestsRemotely) remoteWebDriver
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
