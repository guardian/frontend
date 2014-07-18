package com.gu.discussion.page

import org.openqa.selenium.By._
import org.openqa.selenium.WebDriver

/** Created by glockett.  */
class Support(implicit driver: WebDriver) {

  private def commentRootById(commentId: String) = driver.findElement(id(s"$commentId"))

  def waitForNewCommentItem: CommentItem = {
    //Ugly hack to wait for URL to change
    var retries = 10
    while (!driver.getCurrentUrl().contains("#comment-") || retries < 0) {
      Thread.sleep(500)
      retries = retries - 1
    }
    val newReplyURL = driver.getCurrentUrl()
    val newReplyID = newReplyURL.substring(newReplyURL.indexOf("#") + 1)

    CommentItem(commentRootById(newReplyID))
  }
}
