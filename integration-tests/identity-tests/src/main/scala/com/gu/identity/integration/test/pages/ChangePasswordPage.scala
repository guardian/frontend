package com.gu.identity.integration.test.pages

import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

class ChangePasswordPage(implicit driver: WebDriver) extends UserFormPage {
  private def oldPasswordField: WebElement = findByTestAttribute("old-password")
  private def newPasswordField: WebElement = findByTestAttribute("new-password")
  private def newRepeatPasswordField: WebElement = findByTestAttribute("new-password-repeat")
  private def changePwdButton: WebElement = findByTestAttribute("change-pwd")

  private def resetPwdLink: WebElement = findByTestAttribute("reset-password")

  def enterOldPassword(oldPassword: String) = {
    oldPasswordField.sendKeys(oldPassword)
    this
  }

  def enterNewPassword(oldPassword: String) = {
    newPasswordField.sendKeys(oldPassword)
    this
  }

  def enterNewRepeatPassword(oldPassword: String) = {
    newRepeatPasswordField.sendKeys(oldPassword)
    this
  }

  def submitChangePassword(): PasswordResetConfirmationPage = {
    changePwdButton.click()
    new PasswordResetConfirmationPage()
  }

  def clickResetPasswordLink(): PasswordResetRequestPage = {
    resetPwdLink.click()
    new PasswordResetRequestPage()
  }
}
