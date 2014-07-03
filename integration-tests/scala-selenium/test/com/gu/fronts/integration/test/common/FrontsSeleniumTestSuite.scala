package com.gu.fronts.integration.test.common

import org.openqa.selenium.{ Cookie, WebDriver }
import org.scalatest.{ BeforeAndAfter, FunSuite, Matchers }

import com.gu.fronts.integration.test.config.PropertyLoader
import com.gu.fronts.integration.test.config.PropertyLoader.getProperty
import com.gu.fronts.integration.test.config.WebdriverFactory
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.util.CustomPageFactory

abstract class FrontsSeleniumTestSuite extends FunSuite with BeforeAndAfter with Matchers {

  var webDriver: WebDriver = null

  def frontsBaseUrl: String = getProperty("fronts.base.url")

  lazy val pageFactory: CustomPageFactory = new CustomPageFactory()

  //this will run before all tests of a class
  before {
    System.setProperty(PropertyLoader.PROP_FILE_PATH_ENV_KEY, System.getProperty("user.home") + "/fronts-test-override.properties");
  }

  //this will run before and after each test
  override protected def withFixture(test: NoArgTest) = {
    //webDriver = WebdriverFactory.getSauceLabsWebdriver(testClassMethodName(test))
    webDriver = WebdriverFactory.getFirefoxWebdriver()
    try {
      super.withFixture(test) // Invoke the test function
    } finally {
      webDriver.quit()
    }
  }

  protected def openNetworkFrontPage(): NetworkFrontPage = {
    // need to append this stuff to the url to make it switch to beta site
    webDriver.get(buildBetaSiteUrl(frontsBaseUrl));
    pageFactory.initPage(webDriver, classOf[NetworkFrontPage])
  }

  private def betaSiteCookie: Cookie = {
    new Cookie("GU_VIEW", "responsive")
  }

  /**
   * This will append the request parameters needed to switch to beta site. However, for some reason, this does not work on
   * localhost so had to make a check
   */
  private def buildBetaSiteUrl(frontsBaseUrl: String): String = {
    if (frontsBaseUrl.startsWith("http://localhost")) {
      frontsBaseUrl
    } else {
      frontsBaseUrl + "/preference/platform/mobile?page=" + frontsBaseUrl + "&view=mobile"
    }
  }

  private def testClassMethodName(test: NoArgTest): String = {
    getClass().getSimpleName() + "." + test.name
  }
}