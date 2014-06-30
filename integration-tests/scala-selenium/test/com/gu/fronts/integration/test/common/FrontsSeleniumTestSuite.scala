package com.gu.fronts.integration.test.common

import org.openqa.selenium.WebDriver
import org.scalatest.BeforeAndAfter
import org.scalatest.FunSuite
import org.scalatest.Matchers
import com.gu.fronts.integration.test.config.PropertyLoader.getProperty
import com.gu.fronts.integration.test.config.WebdriverFactory
import com.gu.fronts.integration.test.page.util.CustomPageFactory
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import org.openqa.selenium.Cookie
import com.gu.fronts.integration.test.config.PropertyLoader

abstract class FrontsSeleniumTestSuite extends FunSuite with BeforeAndAfter with Matchers {

  var webDriver: WebDriver = null

  def frontsBaseUrl: String = getProperty("fronts.base.url")

  lazy val pageFactory: CustomPageFactory = new CustomPageFactory()
  
  before{
    webDriver = WebdriverFactory.getDefaultWebDriver
    System.setProperty(PropertyLoader.PROP_FILE_PATH_ENV_KEY, System.getProperty("user.home")+"/fronts-test-override.properties");
  }

  after {
    webDriver.manage().deleteAllCookies()
    webDriver.quit()
  }

  protected def openNetworkFrontPage(): NetworkFrontPage = {
    // need to do this because selenium need to first go to a page of that domain before setting the cookie
    webDriver.get(frontsBaseUrl + "/pagenotfound");
    webDriver.manage().addCookie(betaSiteCookie);
    webDriver.get(frontsBaseUrl)
    pageFactory.initPage(webDriver, classOf[NetworkFrontPage])
  }

  private def betaSiteCookie: Cookie = {
    new Cookie("GU_VIEW", "responsive")
  }

}