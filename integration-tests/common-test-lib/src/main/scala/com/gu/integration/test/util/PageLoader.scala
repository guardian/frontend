package com.gu.integration.test.util

import org.openqa.selenium.WebDriver

import com.gu.automation.support.Config
import com.gu.automation.support.TestLogging
import com.gu.integration.test.pages.common.ParentPage

/**
 * This class is for loading and initializing pages and page objects. Example usage: <code></code>
 */
object PageLoader extends TestLogging {

  val frontsBaseUrl = Config().getTestBaseUrl //getProperty(BaseUrl)
  val TestAttributeName = "data-test-id"

  /**
   * This method goes to a particular URL and then initializes the provided page object and returns it. To property use it
   * provide a lazy val page object
   */
  def goTo[Page <: ParentPage](absoluteUrl: String, pageObject: => Page)(implicit driver: WebDriver): Page = {
    driver.get(forceBetaSite(turnOfPopups(absoluteUrl)))
    pageObject
  }

  def fromRelativeUrl(relativeUrl: String): String = {
    frontsBaseUrl + relativeUrl
  }

  def turnOfPopups(url: String): String = {
    url + "?test=true"
  }

  /**
   * This will append the request parameters needed to switch to beta site. However, for some reason, this does not work on
   * localhost so had to make a check
   */
  def forceBetaSite(url: String): String = {
    if (frontsBaseUrl.startsWith("http://localhost")) {
      url
    } else {
      frontsBaseUrl + "/preference/platform/mobile?page=" + url + "&view=mobile"
    }
  }
}