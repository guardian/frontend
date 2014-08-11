package com.gu.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.PageLoader
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class BaseSteps(implicit driver: WebDriver) extends TestLogging with Matchers {
  def goToStartPage(): ParentPage = {
    logger.step(s"I am an Article page with relative url: ${PageLoader.frontsBaseUrl}")
    lazy val parentPage = new ParentPage()
    goTo(parentPage)
  }
}
