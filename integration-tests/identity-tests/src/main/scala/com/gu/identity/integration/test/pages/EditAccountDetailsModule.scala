package com.gu.identity.integration.test.pages

import com.gu.integration.test.util.ElementLoader._
import com.gu.integration.test.util.WebElementEnhancer._
import org.openqa.selenium.support.ui.Select
import org.openqa.selenium.{WebDriver, WebElement}

class EditAccountDetailsModule(implicit driver: WebDriver) extends UserFormPage {
  private def emailField: WebElement = findByTestAttribute("email-address")
  private def firstNameField: WebElement = findByTestAttribute("first-name")
  private def lastNameField: WebElement = findByTestAttribute("last-name")

  private def addressLine1Field: WebElement = findByTestAttribute("addr-line-1")
  private def addressLine2Field: WebElement = findByTestAttribute("addr-line-2")
  private def townField: WebElement = findByTestAttribute("addr-town")
  private def countyField: WebElement = findByTestAttribute("addr-county")
  private def postCodeField: WebElement = findByTestAttribute("addr-postcode")
  private def countrySelectElement: WebElement = findByTestAttribute("addr-country")

  private def signInName: WebElement = findByTestAttribute("sign-in-name")
  private def saveChangesButton: WebElement = findByTestAttribute("save-changes")

  def selectFirstValidCountry() = {
    val countrySelect = new Select(countrySelectElement)
    //ignore the first two elements as they seem to not be countries
    countrySelect.selectByIndex(2)
    logger.debug(s"Selected country ${countrySelect.getFirstSelectedOption.getText}")
  }

  def enterEmailAddress(email: String) = {
    clearAndSetField(emailField, email)
  }

  def enterFirstName(firstName: String) = {
    clearAndSetField(firstNameField, firstName)
  }

  def enterLastName(lastName: String) = {
    clearAndSetField(lastNameField, lastName)
  }

  def enterAddressLine1(addrLine1: String) = {
    clearAndSetField(addressLine1Field, addrLine1)
  }

  def enterAddressLine2(addrLine2: String) = {
    clearAndSetField(addressLine2Field, addrLine2)
  }

  def enterTown(town: String) = {
    clearAndSetField(townField, town)
  }

  def enterCounty(county: String) = {
    clearAndSetField(countyField, county)
  }

  def enterPostCode(postCode: String) = {
    clearAndSetField(postCodeField, postCode)
  }

  def saveChanges() = {
    saveChangesButton.scrollIntoView()
    saveChangesButton.click()
  }

  def clearAndSetField(fieldElement: WebElement, fieldValue: String) = {
    fieldElement.clear()
    fieldElement.sendKeys(fieldValue)
  }

  //The reason for these seemingly uneccessary getters is because there is some principle which says you cannot expose
  //web elements directly
  def getEmailAddress() = {
    emailField.getText
  }

  def getFirstName() = {
    firstNameField.getText
  }

  def getLastName() = {
    lastNameField.getText
  }

  def getAddressLine1Field: String = {
    addressLine1Field.getText
  }
  def getAddressLine2Field: String = {
    addressLine2Field.getText
  }
  def getTownField: String = {
    townField.getText
  }
  def getCountyField: String = {
    countyField.getText
  }

  def getPostCodeField: String = {
    postCodeField.getText
  }

  def getSelectedCountry: String = {
    new Select(countrySelectElement).getFirstSelectedOption.getText
  }

  def getSignInName: String = {
    signInName.getText
  }
}
