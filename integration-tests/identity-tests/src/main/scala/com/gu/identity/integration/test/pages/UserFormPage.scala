package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebDriver, WebElement}

/**
 * Any page which contains user form fields
 */
class UserFormPage(implicit driver: WebDriver) extends ParentPage {

  private def validationErrors: List[WebElement] = findAllByTestAttribute("form-field-error")

  def getAllValidationErrorElements(): List[WebElement] = {
    displayedElements(validationErrors, 1)
  }
}