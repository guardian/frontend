package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

class EditAccountDetailsModule(implicit driver: WebDriver) extends ParentPage {
  private def emailField: WebElement = findByTestAttribute("email-address")
  private def saveChangesButton: WebElement = findByTestAttribute("save-changes")
  private def validationErrors: List[WebElement] = findAllByTestAttribute("form-field-error")

  def enterEmailAddress(email: String) = {
    emailField.clear()
    emailField.sendKeys(email)
  }

  def getEmailAddress() = {
    emailField.getText
  }

  def getAllValidationErrorElements(): List[WebElement] = {
    displayedElements(validationErrors)
  }

  def saveChanges() ={
    saveChangesButton.click()
  }
}
