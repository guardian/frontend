package com.gu.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.integration.test.pages.common.{TermsOfServicePage, ParentPage}
import com.gu.integration.test.util.PageLoader
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class BaseSteps(implicit driver: WebDriver) extends TestLogging with Matchers {
  def goToStartPage(useBetaRedirect: Boolean = true): ParentPage = {
    logger.step(s"I am on base page at url: $frontsBaseUrl")
    lazy val parentPage = new ParentPage()
    goTo(parentPage, frontsBaseUrl, useBetaRedirect)
  }

  def goToTermsOfServicePage(useBetaRedirect: Boolean = true): TermsOfServicePage = {
    logger.step(s"I am on base page at url: $frontsBaseUrl")
    lazy val tosPage = new TermsOfServicePage()
    goTo(tosPage, fromRelativeUrl("/help/terms-of-service"))
  }
}
