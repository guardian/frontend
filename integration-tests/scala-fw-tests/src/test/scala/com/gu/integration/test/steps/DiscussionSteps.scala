package com.gu.integration.test.steps

import org.openqa.selenium.WebDriver
import org.openqa.selenium.support.ui.ExpectedConditions
import org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf
import org.scalatest.Matchers

import com.gu.automation.support.TestLogging
import com.gu.integration.test.pages.common.DiscussionsContainerModule
import com.gu.integration.test.util.ElementLoader.waitUntil

case class DiscussionSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def checkDiscussionContentIsProperlyLoaded(commentsModule: DiscussionsContainerModule) = {
    logger.step("Check that discussionc content is displayed properly")
    waitUntil(visibilityOf(commentsModule.commentsContainer), 10)
    commentsModule.commentsContainer.isDisplayed should be (true)
    commentsModule.viewAllComments.isDisplayed should be (true)
    
    commentsModule.commentsViewType.click
    waitUntil(ExpectedConditions.not(visibilityOf(commentsModule.viewAllComments)))
    
    commentsModule.commentsViewType.click
    waitUntil(visibilityOf(commentsModule.viewAllComments))
    
    commentsModule.viewAllComments.click()
    waitUntil(ExpectedConditions.not(visibilityOf(commentsModule.viewAllComments)))
  }
}
