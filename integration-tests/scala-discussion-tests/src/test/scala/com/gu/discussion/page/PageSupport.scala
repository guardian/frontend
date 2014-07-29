package com.gu.discussion.page

import com.gu.automation.support.page.{ExplicitWait}
import org.openqa.selenium.By._
import org.openqa.selenium.{WebDriver}
import org.openqa.selenium.support.ui.{ExpectedCondition}

class PageSupport(implicit driver: WebDriver) {

  private def commentRootById(commentId: String) = driver.findElement(id(s"$commentId"))

  def waitForNewCommentItem: CommentItem = {
    val e = new ExpectedCondition[Boolean]() {
      def apply(d: WebDriver): Boolean = {
        return (d.getCurrentUrl() contains "#comment-")
      }
    }

    ExplicitWait().until(e);

  val newReplyURL = driver.getCurrentUrl()
  val newReplyID = newReplyURL.substring(newReplyURL.indexOf("#") + 1)

  CommentItem(commentRootById(newReplyID))
  }


}
