package com.gu.identity.integration.test.pages

import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.support.ui.ExpectedConditions._
import org.openqa.selenium.{WebDriver, WebElement}

class PasswordResetConfirmationPage(implicit driver: WebDriver) extends ContainerWithSigninModulePage {
  private def confirmation: WebElement = findByTestAttribute("password-reset-confirmation")

  def isPasswordChangeMsgDisplayed(): Boolean = {
    waitUntil(visibilityOf(confirmation))
  }
}
