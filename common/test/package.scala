package test

import play.api.test._
import play.api.test.Helpers._
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import common.GuardianConfiguration
import java.net.{ HttpURLConnection, URL }
import org.scalatest.concurrent.Eventually
import org.scalatest.time.{ Millis, Seconds, Span }
import play.libs.WS
import org.openqa.selenium.WebDriver

/**
 * Executes a block of code in a running server, with a test HtmlUnit browser.
 */
class EditionalisedHtmlUnit(config: GuardianConfiguration) extends Eventually {

  implicit override val patienceConfig =
    PatienceConfig(timeout = scaled(Span(30, Seconds)), interval = scaled(Span(5, Millis)))

  import config.edition._

  val Port = """.*:(\d*)$""".r

  def apply[T](path: String)(block: TestBrowser => T): T = UK(path)(block)

  def UK[T](path: String)(block: TestBrowser => T): T = goTo(path, "http://" + ukHost)(block)

  def US[T](path: String)(block: TestBrowser => T): T = goTo(path, "http://" + usHost)(block)

  def connection[T](path: String)(block: HttpURLConnection => T): T = {
    connectionUK(path)(block)
  }

  def connectionUK[T](path: String)(block: HttpURLConnection => T): T = {
    testConnection("http://" + ukHost, path)(block)
  }

  def connectionUS[T](path: String)(block: HttpURLConnection => T): T = {
    testConnection("http://" + usHost, path)(block)
  }

  private def testConnection[T](host: String, path: String)(block: HttpURLConnection => T): T = {

    val port = host match {
      case Port(p) => p.toInt
      case _ => 9000
    }
    running(TestServer(port), HTMLUNIT) { browser =>
      // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
      browser.webDriver.asInstanceOf[HtmlUnitDriver] setJavascriptEnabled false

      val connection = (new URL(host + path)).openConnection().asInstanceOf[HttpURLConnection]
      block(connection)
    }
  }

  private def goTo[T](path: String, host: String)(block: TestBrowser => T): T = {

    val port = host match {
      case Port(p) => p.toInt
      case _ => 9000
    }

    running(TestServer(port), HTMLUNIT) {
      browser =>

        // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
        browser.webDriver.asInstanceOf[HtmlUnitDriver] setJavascriptEnabled false

        browser.goTo(host + path)
        block(browser)
    }
  }

  // copy n paste job from https://github.com/playframework/Play20/blob/master/framework/src/play-test/src/main/scala/play/api/test/Helpers.scala
  private def running[T, WEBDRIVER <: WebDriver](testServer: TestServer, webDriver: Class[WEBDRIVER])(block: TestBrowser => T): T = {
    var browser: TestBrowser = null
    try {
      testServer.start()
      browser = TestBrowser.of(webDriver)

      println("-----------------------------------------------------------------------------------")

      val p = eventually { block(browser) }

      println("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

      p
    } finally {
      if (browser != null) {
        browser.quit()
      }
      testServer.stop()
    }
  }
}

object WithHost {
  def apply(path: String)(implicit config: GuardianConfiguration): String = UK(path)(config)
  def UK(path: String)(implicit config: GuardianConfiguration): String = "http://" + config.edition.ukHost + path
  def US(path: String)(implicit config: GuardianConfiguration): String = "http://" + config.edition.usHost + path
}

/**
 * Executes a block of code in a FakeApplication.
 */
object Fake {
  def apply[T](block: => T): T = running(FakeApplication()) { block }
}