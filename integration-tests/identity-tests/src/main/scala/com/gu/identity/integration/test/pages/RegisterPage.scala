package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

class RegisterPage(implicit driver: WebDriver) extends UserFormPage {
  private def emailInputField: WebElement = findByTestAttribute("reg-email")
  private def userNameInputField: WebElement = findByTestAttribute("reg-username")
  private def pwdInputField: WebElement = findByTestAttribute("reg-pwd")
  def createButton: WebElement = findByTestAttribute("create-user-button")

  def enterEmail(email: String) = {
    emailInputField.sendKeys(email)
    this
  }

  def enterPwd(pwd: String) = {
    pwdInputField.sendKeys(pwd)
    this
  }

  def enterUsername(userName: String) = {
    userNameInputField.sendKeys(userName)
    this
  }
}
