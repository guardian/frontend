package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

class SignInPage(implicit driver: WebDriver) extends ParentPage {
  private val emailInputField: WebElement = findByTestAttribute("signin-email")
  private val pwdInputField: WebElement = findByTestAttribute("signin-pwd")
  val signInButton: WebElement = findByTestAttribute("sign-in-button")

  def enterEmail(email: String) {
    emailInputField.sendKeys(email)
    this
  }

  def enterPwd(pwd: String) {
    pwdInputField.sendKeys(pwd)
    this
  }
}
