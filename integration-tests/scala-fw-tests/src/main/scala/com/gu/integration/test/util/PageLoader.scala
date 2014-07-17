package com.gu.fronts.integration.test

import scala.collection.JavaConverters.asScalaBufferConverter
import org.openqa.selenium.By
import org.openqa.selenium.SearchContext
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.automation.support.TestLogging
import com.gu.integration.test.config.PropertyLoader._
import com.gu.integration.test.pages.common.ParentPage

/**
 * This class is for loading and initializing pages and page objects. Example usage: <code></code>
 */
object PageLoader extends TestLogging {

  val frontsBaseUrl = getProperty(BaseUrl)
  val TestAttributeName = "data-test-id"

  /**
   * This method goes to a particular URL and then initializes the provided page object and returns it. To property use it
   * provide a lazy val page object
   */
  def goTo[Page <: ParentPage](absoluteUrl: String, pageObject: => Page)(implicit driver: WebDriver): Page = {
    driver.get(forceBetaSite(absoluteUrl))
    pageObject
  }

  def fromRelativeUrl(relativeUrl: String): String = {
    frontsBaseUrl + relativeUrl
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