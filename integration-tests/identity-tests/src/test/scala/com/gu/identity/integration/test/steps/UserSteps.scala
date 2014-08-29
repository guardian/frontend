package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages._
import com.gu.identity.integration.test.util.User._
import com.gu.identity.integration.test.util.{FormError, User}
import com.gu.integration.test.expectedconditions.ResetEmailHasArrived
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.ElementLoader._
import com.gu.integration.test.util.PageLoader._
import com.gu.integration.test.util.UserConfig._
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

  def changeEmailTo(newEmail: String, editAccountDetailsModule: EditAccountDetailsModule): Either[List[FormError], String] = {
    logger.step(s"Changing account email to $newEmail")
    editAccountDetailsModule.enterEmailAddress(newEmail)

    editAccountDetailsModule.saveChanges()

    waitForPageToLoad

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

    waitForPageToLoad

    editAccountDetailsModule.getAllValidationFormErrors() should be('empty)
    User.fromEditAccountDetailsForm(editAccountDetailsModule)
  }

  def changeAddress(editAccountDetailsModule: EditAccountDetailsModule): User = {
    logger.step("Changing address fields")
    editAccountDetailsModule.enterAddressLine1(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterAddressLine2(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterTown(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterCounty(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.enterPostCode(generateRandomAlphaNumericString(7))
    editAccountDetailsModule.selectFirstValidCountry()
    editAccountDetailsModule.saveChanges()

    waitForPageToLoad

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

    waitForPageToLoad

    changePwdPage.getAllValidationFormErrors() should be('empty)
    resetConfirmPage.isPasswordChangeMsgDisplayed()

    waitForPageToLoad

    BaseSteps().goToStartPage(useBetaRedirect = false)
    NewPasswordAndContainerWithSigninModule(newPwd, new ContainerWithSigninModulePage())
  }

  def requestToResetPassword(pageWithSignInModule: ContainerWithSigninModulePage) = {
    logger.step("Requesting to reset the account password")
    val profileNavMenu = pageWithSignInModule.signInModule().clickSignInLinkWhenLoggedIn()
    val changePwdPage = profileNavMenu.clickChangePassword()

    val resetPwdPage = changePwdPage.clickResetPasswordLink()

    resetPwdPage.enterPasswordResetEmail(get("googleEmail"))
    resetPwdPage.clickResetPassword()

    waitForPageToLoad
  }

  def checkResetPasswordMailAndGoToResetPwdPage(): PasswordResetPage = {
    logger.step(s"Opening password reset mail and following the provided link")
    val latestResetEmail = waitUntilObject(new ResetEmailHasArrived(get("googleEmail"), get("googlePwd")), 30)

    lazy val pwdResetPage = new PasswordResetPage()
    goTo(pwdResetPage, latestResetEmail.getResetPasswordLink().get, useBetaRedirect = false)

    pwdResetPage
  }

  def resetPassword(pwdResetPage: PasswordResetPage): NewPasswordAndContainerWithSigninModule = {
    logger.step(s"Resetting password")
    val resetPwd = generateRandomAlphaNumericString(10)
    pwdResetPage.enterNewPassword(resetPwd)
    pwdResetPage.enterNewRepeatPassword(resetPwd)

    val resetConfirmPage = pwdResetPage.submitChangePassword()

    waitForPageToLoad

    pwdResetPage.getAllValidationFormErrors() should be('empty)
    resetConfirmPage.isPasswordChangeMsgDisplayed()

    waitForPageToLoad

    BaseSteps().goToStartPage(useBetaRedirect = false)
    NewPasswordAndContainerWithSigninModule(resetPwd, new ContainerWithSigninModulePage())
  }
}

case class NewPasswordAndContainerWithSigninModule(newPwd: String, containerWithSignInpage: ContainerWithSigninModulePage)
