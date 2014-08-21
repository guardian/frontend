package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages.{ContainerWithSigninModulePage, EditAccountDetailsModule, EditProfilePage}
import com.gu.identity.integration.test.util.User._
import com.gu.identity.integration.test.util.{FormError, User}
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

/**
 * Steps regarding the user, generally after he has been logged in, but also for creating a user
 */
case class UserSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def goToEditProfilePage(pageWithSignInModule: ContainerWithSigninModulePage): EditProfilePage = {
    logger.step("Going to the edit profile page")
    val profileNavMenu = pageWithSignInModule.signInModule().clickSignInLinkWhenLoggedIn()
    profileNavMenu.clickEditProfile()
  }

  def createRandomBasicUser(): Either[List[FormError], User] = {
    logger.step("Creating random user")
    BaseSteps().goToStartPage(useBetaRedirect = false)
    val registerPage = SignInSteps().clickSignInLink().clickRegisterNewUserLink()
    val userOrFormErrors = RegisterSteps().registerNewTempUser(registerPage)
    userOrFormErrors
  }

  def createUserWithUserName(userName: String): Either[List[FormError], User] = {
    logger.step(s"Creating user with username: $userName")
    BaseSteps().goToStartPage(useBetaRedirect = false)
    val registerPage = SignInSteps().clickSignInLink().clickRegisterNewUserLink()
    val userOrFormErrors = RegisterSteps().registerUserWithUserName(registerPage, userName)
    userOrFormErrors
  }

  def goToEditAccountDetailsPage(pageWithSignInModule: ContainerWithSigninModulePage): EditAccountDetailsModule = {
    logger.step("Going to the edit account details page")
    val editProfilePage = goToEditProfilePage(pageWithSignInModule)
    editProfilePage.clickEditAccountDetailsTab()
  }

  def changeEmail(editAccountDetailsModule: EditAccountDetailsModule): Either[List[FormError], String] = {
    changeEmailTo(generateRandomEmail, editAccountDetailsModule)
  }

  def changeEmailTo(newEmail:String, editAccountDetailsModule: EditAccountDetailsModule): Either[List[FormError], String] = {
    logger.step(s"Changing account email to $newEmail")
    editAccountDetailsModule.enterEmailAddress(newEmail)
    editAccountDetailsModule.saveChanges()

    waitForPageToBeLoaded

    val userFormErrors = editAccountDetailsModule.getAllValidationFormErrors()
    if (userFormErrors.nonEmpty) {
      Left(userFormErrors)
    } else {
      Right(editAccountDetailsModule.getEmailAddress())
    }
  }

  def changeFirstAndLastName(editAccountDetailsModule: EditAccountDetailsModule): User = {
    logger.step("Changing first and last name")
    editAccountDetailsModule.enterFirstName(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterLastName(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.saveChanges()

    waitForPageToBeLoaded

    editAccountDetailsModule.getAllValidationFormErrors() should be('empty)
    User.fromEditAccountDetailsForm(editAccountDetailsModule)
  }

  def changeAddress(editAccountDetailsModule: EditAccountDetailsModule): User = {
    logger.step("Changing first and last name")
    editAccountDetailsModule.enterAddressLine1(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterAddressLine2(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterTown(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterCounty(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterPostCode(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.selectFirstValidCountry()
    editAccountDetailsModule.saveChanges()

    waitForPageToBeLoaded

    editAccountDetailsModule.getAllValidationFormErrors() should be('empty)
    User.fromEditAccountDetailsForm(editAccountDetailsModule)
  }

  def checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange: User): EditAccountDetailsModule = {
    logger.step("Checking user is logged in and going to account details page")
    val startPage = SignInSteps().checkUserIsLoggedIn(userBeforeChange)
    val editAccountDetailsModule = UserSteps().goToEditAccountDetailsPage(startPage)
    editAccountDetailsModule
  }

  def changePassword(pageWithSignInModule: ContainerWithSigninModulePage, userBeforeChange: User):
      NewPasswordAndContainerWithSigninModule = {
    logger.step("Changing user password")
    val profileNavMenu = pageWithSignInModule.signInModule().clickSignInLinkWhenLoggedIn()
    val changePwdPage = profileNavMenu.clickChangePassword()

    changePwdPage.enterOldPassword(userBeforeChange.pwd.get)
    val newPwd = generateRandomAlphaNumericString(10)
    changePwdPage.enterNewPassword(newPwd)
    changePwdPage.enterNewRepeatPassword(newPwd)
    val resetConfirmPage = changePwdPage.submitChangePassword()

    waitForPageToBeLoaded

    changePwdPage.getAllValidationFormErrors() should be('empty)
    resetConfirmPage.isPasswordChangeMsgDisplayed()

    waitForPageToBeLoaded

    BaseSteps().goToStartPage(useBetaRedirect = false)
    NewPasswordAndContainerWithSigninModule(newPwd, new ContainerWithSigninModulePage())
  }
}

case class NewPasswordAndContainerWithSigninModule(newPwd: String, containerWithSignInpage: ContainerWithSigninModulePage)
