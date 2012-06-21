package test

import org.openqa.selenium.htmlunit.HtmlUnitDriver
import play.api.test._
import play.api.test.Helpers._

object `package` {

  /**
   * Executes a block of code in a running server, with a test HtmlUnit browser.
   */
  def HtmlUnit[T](path: String)(block: TestBrowser => T): T = {
    running(TestServer(3333), HTMLUNIT) {
      browser =>
        // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
        browser.webDriver.asInstanceOf[HtmlUnitDriver] setJavascriptEnabled false

        browser.goTo("http://localhost:3333" + path)
        block(browser)
    }
  }

  /**
   * Executes a block of code in a FakeApplication.
   */
  def Fake[T](block: => T): T = running(FakeApplication()) { block }
}