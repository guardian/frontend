package test

import com.gargoylesoftware.htmlunit.BrowserVersion
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import play.api.test.{TestServer, TestBrowser, FakeApplication}
import play.api.test.Helpers._

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit(conf.HealthCheck.testPort.toString)
}

class EditionalisedHtmlUnit(val port: String) extends TestSettings {

  // the default is I.E 7 which we do not support
  BrowserVersion.setDefault(BrowserVersion.CHROME)

  val host = s"http://localhost:${port}"

  def apply[T](path: String)(block: TestBrowser => T): T = goTo(path, host)(block)

  protected def goTo[T](path: String, host: String)(block: TestBrowser => T): T = {

    running(TestServer(port.toInt,
      FakeApplication(withGlobal = globalSettingsOverride)), HTMLUNIT) { browser =>

      // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
      browser.webDriver.asInstanceOf[HtmlUnitDriver].setJavascriptEnabled(false)

      browser.goTo(host + path)
      block(browser)
    }
  }
}

/**
 * Executes a block of code in a FakeApplication.
 */
trait FakeApp extends TestSettings {

  def apply[T](block: => T): T = running(
    FakeApplication(
      withGlobal = globalSettingsOverride,
      additionalConfiguration = Map(
        "application.secret" -> "this_is_not_a_real_secret_just_for_tests"
      )
    )
  ) { block }
}

object Fake extends FakeApp
