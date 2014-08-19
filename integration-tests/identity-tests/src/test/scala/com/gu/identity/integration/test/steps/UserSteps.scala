package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages.{ContainerWithSigninModulePage, EditAccountDetailsModule, EditProfilePage}
import com.gu.identity.integration.test.util.User
import com.gu.identity.integration.test.util.User._
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class UserSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def goToEditProfilePage(pageWithSignInModule: ContainerWithSigninModulePage): EditProfilePage = {
    logger.step("Going to the edit profile page")
    val profileNavMenu = pageWithSignInModule.signInModule().clickSignInLinkWhenLoggedIn()
    profileNavMenu.clickEditProfile()
  }

  def createRandomBasicUser(): User = {
    logger.step("Creating random user")
    BaseSteps().goToStartPage(useBetaRedirect = false)
    val registerPage = SignInSteps().clickSignInLink().clickRegisterNewUserLink()
    val userBeforeChange = RegisterSteps().registerNewTempUser(registerPage)
    userBeforeChange
  }

  def goToEditAccountDetailsPage(pageWithSignInModule: ContainerWithSigninModulePage): EditAccountDetailsModule = {
    logger.step("Going to the edit account details page")
    val editProfilePage = goToEditProfilePage(pageWithSignInModule)
    editProfilePage.clickEditAccountDetailsTab()
  }

  def changeEmail(editAccountDetailsModule: EditAccountDetailsModule): String = {
    logger.step("Changing account email")
    editAccountDetailsModule.enterEmailAddress(generateRandomEmail)
    editAccountDetailsModule.saveChanges()

    waitForPageToBeLoaded

    editAccountDetailsModule.getAllValidationErrorElements() should be('empty)
    editAccountDetailsModule.getEmailAddress()
  }

  def changeFirstAndLastName(editAccountDetailsModule: EditAccountDetailsModule): User = {
    logger.step("Changing first and last name")
    editAccountDetailsModule.enterFirstName(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterLastName(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.saveChanges()

    waitForPageToBeLoaded

    editAccountDetailsModule.getAllValidationErrorElements() should be('empty)
    User.fromEditAccountDetailsForm(editAccountDetailsModule)
  }

  def changeAddress(editAccountDetailsModule: EditAccountDetailsModule): User = {
    logger.step("Changing first and last name")
    editAccountDetailsModule.enterAddressLine1(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterAddressLine2(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterTown(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterCounty(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterPostCode(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.selectRandomCountry()
    editAccountDetailsModule.saveChanges()

    waitForPageToBeLoaded

    editAccountDetailsModule.getAllValidationErrorElements() should be('empty)
    User.fromEditAccountDetailsForm(editAccountDetailsModule)
  }

  def checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange: User): EditAccountDetailsModule = {
    logger.step("Checking user is logged in and going to account details page")
    val startPage = SignInSteps().checkUserIsLoggedIn(userBeforeChange)
    val editAccountDetailsModule = UserSteps().goToEditAccountDetailsPage(startPage)
    editAccountDetailsModule
  }
}
