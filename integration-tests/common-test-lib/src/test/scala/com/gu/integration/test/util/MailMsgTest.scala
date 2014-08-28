package com.gu.integration.test.util

import java.util.Date

import org.scalatest.FunSuite

class MailMsgTest extends FunSuite {

  test("getting password reset link") {
    val expectedResetLink = "https://profile.code.dev-theguardian.com/c/ad36e5be-"
    val resetLink = MailMsg("subject",
      s"""This email is to let you know that someone, probably you, recently asked us
         |to reset the password on the theguardian.com account belonging to
         |shahin.test@guardian.co.uk\n\nIn order to reset your password, please follow the link below
         |$expectedResetLink
         If your email software does not allow you to click the link, please copy it
         into your browser’s address bar.""".stripMargin, new Date())
      .getResetPasswordLink()
    assert(expectedResetLink.equals(resetLink.get))
  }

  test("getting no password reset link in message with no link") {
    val resetLink = MailMsg("subject", "This email is to let you know that someone, probably you,\n", new Date())
      .getResetPasswordLink()
    assert(resetLink.isDefined == false)
  }

  test("getting no password reset link in empty message") {
    val resetLink = MailMsg("subject", "", new Date())
      .getResetPasswordLink()
    assert(resetLink.isDefined == false)
  }
}
