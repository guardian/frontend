package test

import play.api.test._
import play.api.test.Helpers._
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import common.GuardianConfiguration
import java.net.{ HttpURLConnection, URL }

/**
 * Executes a block of code in a running server, with a test HtmlUnit browser.
 */
class EditionalisedHtmlUnit(config: GuardianConfiguration) {

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
    running(TestServer(port, ConfiguredApp()), HTMLUNIT) { browser =>
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

    running(TestServer(port, ConfiguredApp()), HTMLUNIT) { browser =>

      // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
      browser.webDriver.asInstanceOf[HtmlUnitDriver] setJavascriptEnabled false

      browser.goTo(host + path)
      block(browser)
    }
  }
}

//turns out that FakeApplicaiton does not pick up the config from application.conf
//so some test config needs to be put here.
private object ConfiguredApp {
  def apply() = FakeApplication(
    additionalConfiguration = Map(
      "play.akka.actor.promises-dispatcher.timeout" -> "20s"
    )
  )
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
  def apply[T](block: => T): T = running(ConfiguredApp()) { block }
}