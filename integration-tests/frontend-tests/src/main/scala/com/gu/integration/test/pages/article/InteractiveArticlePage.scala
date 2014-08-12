package com.gu.integration.test.pages.article

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.ui.ExpectedConditions.not
import org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf
import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.pages.common.PopularInModule
import com.gu.integration.test.util.ElementLoader._
import com.gu.integration.test.pages.common.InteractiveContentIFrameModule

class InteractiveArticlePage(implicit driver: WebDriver) extends ParentPage {
  val interactiveArticleBodyContainer: WebElement = findByTestAttribute("interactive-content-body")

  def contentBodyIFrame() = {
    new InteractiveContentIFrameModule(firstDisplayedIframe(interactiveArticleBodyContainer))
  }
}