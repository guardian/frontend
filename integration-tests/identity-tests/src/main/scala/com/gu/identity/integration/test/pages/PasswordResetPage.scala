package com.gu.identity.integration.test.pages

import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

class PasswordResetPage(implicit driver: WebDriver) extends UserFormPage {
  private def newPasswordField: WebElement = findByTestAttribute("reset-new-password")
  private def newRepeatPasswordField: WebElement = findByTestAttribute("reset-password-repeat")
  private def resetPwdButton: WebElement = findByTestAttribute("reset-pwd")

  def enterNewPassword(oldPassword: String) = {
    newPasswordField.sendKeys(oldPassword)
    this
  }

  def enterNewRepeatPassword(oldPassword: String) = {
    newRepeatPasswordField.sendKeys(oldPassword)
    this
  }

  def submitChangePassword(): PasswordResetConfirmationPage = {
    resetPwdButton.click()
    new PasswordResetConfirmationPage()
  }
}
