package com.gu.integration.test.pages.common

import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

class TermsOfServicePage(implicit driver: WebDriver) extends ParentPage {
  private val tosContent: WebElement = findByTestAttribute("article-review-body")

  def getContent(): String = {
    tosContent.getText
  }
}