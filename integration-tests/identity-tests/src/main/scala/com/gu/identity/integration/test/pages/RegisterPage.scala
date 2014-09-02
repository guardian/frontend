package com.gu.identity.integration.test.pages

import com.gu.integration.test.util.ElementLoader._
import com.gu.integration.test.util.WebElementEnhancer._
import org.openqa.selenium.{WebDriver, WebElement}

class RegisterPage(implicit driver: WebDriver) extends UserFormPage {
  private def emailInputField: WebElement = findByTestAttribute("reg-email")
  private def userNameInputField: WebElement = findByTestAttribute("reg-username")
  private def firstNameInputField: WebElement = findByTestAttribute("reg-first-name")
  private def lastNameInputField: WebElement = findByTestAttribute("reg-second-name")
  private def pwdInputField: WebElement = findByTestAttribute("reg-pwd")
  private def createButton: WebElement = findByTestAttribute("create-user-button")

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

  def enterFirstName(firstName: String) = {
    firstNameInputField.sendKeys(firstName)
    this
  }

  def enterLastName(lastName: String) = {
    lastNameInputField.sendKeys(lastName)
    this
  }

  def clickCreateUser() = {
    createButton.scrollIntoView()
    createButton.click()
    this
  }
}
