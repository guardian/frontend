package com.gu.identity.integration.test.pages

import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebElement, WebDriver}

class PasswordResetRequestPage(implicit driver: WebDriver) extends ContainerWithSigninModulePage {

  private def pwdResetEmailField: WebElement = findByTestAttribute("password-reset-email")
  private def pwdResetButton: WebElement = findByTestAttribute("reset-password-btn")

  def enterPasswordResetEmail(passwordResetEmail: String) = {
    pwdResetEmailField.sendKeys(passwordResetEmail)
    this
  }

  def clickResetPassword() = {
    pwdResetButton.click()
  }
}
