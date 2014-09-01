package com.gu.integration.test.expectedconditions

import com.gu.integration.test.util.{MailClient, MailMsg}
import org.openqa.selenium.WebDriver
import org.openqa.selenium.support.ui.ExpectedCondition
import org.scalatest.FunSuite

/**
 * Checks for unread reset password emails by its subject and then returns the most recent
 */
class ResetEmailHasArrived(email: String, emailPwd: String) extends ExpectedCondition[MailMsg] {
  val ResetPasswordSubject: String = "Your theguardian.com account"

  override def apply(webdriver: WebDriver): MailMsg = {
    val latestMailOption = MailClient.findRecentEmailsBySubjectSortedDescByReceivedDate(email, emailPwd,
      ResetPasswordSubject)
      .headOption
    if (latestMailOption.isDefined) {
      latestMailOption.get
    }
    else {
      null
    }
  }
}