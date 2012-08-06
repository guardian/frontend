package test

import play.api.test._
import play.api.test.Helpers._
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import common.GuardianConfiguration

/**
 * Executes a block of code in a running server, with a test HtmlUnit browser.
 */
class EditionalisedHtmlUnit(config: GuardianConfiguration) {

  import config.edition._

  val Port = """.*:(\d*)$""".r

  def apply[T](path: String)(block: TestBrowser => T): T = UK(path)(block)

  def UK[T](path: String)(block: TestBrowser => T): T = goTo(path, "http://" + ukHost)(block)

  def US[T](path: String)(block: TestBrowser => T): T = goTo(path, "http://" + usHost)(block)

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