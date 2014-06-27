package com.gu.fronts.integration.test.common

import com.gu.fronts.integration.test.config.PropertyLoader.getProperty
import org.junit.After
import org.openqa.selenium.WebDriver
import com.gu.fronts.integration.test.config.WebdriverFactory
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.util.CustomPageFactory
import org.openqa.selenium.Cookie

class FrontsIntegrationTestCase {

  protected var webDriver: WebDriver = WebdriverFactory.getDefaultWebDriver

  private var frontsBaseUrl: String = getProperty("fronts.base.url")

  protected var pageFactoryHelper: CustomPageFactory = new CustomPageFactory()

  @After
  def cleanSlate() {
    webDriver.manage().deleteAllCookies()
    webDriver.quit()
  }

  protected def openNetworkFrontPage(): NetworkFrontPage = {
    // need to do this because selenium need to first go to a page before setting the cookie
    webDriver.get(frontsBaseUrl + "/pagenotfound");
    webDriver.manage().addCookie(new Cookie("GU_VIEW", "responsive"));
    webDriver.get(frontsBaseUrl)
    pageFactoryHelper.initPage(webDriver, classOf[NetworkFrontPage])
  }
}