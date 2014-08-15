package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

class EditAccountDetailsModule(implicit driver: WebDriver) extends ParentPage {
  def emailField: WebElement = findByTestAttribute("email-address")
  def saveChangesButton: WebElement = findByTestAttribute("save-changes")
  private def validationErrors: List[WebElement] = findAllByTestAttribute("form-field-error")

  def enterEmailAddress(email: String) = {
    emailField.clear()
    emailField.sendKeys(email)
  }

  def getAllValidationErrorElements(): List[WebElement] = {
    displayedElements(validationErrors)
  }
}
