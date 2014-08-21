package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages.{ContainerWithSigninModulePage, EditAccountDetailsModule, EditProfilePage, RegisterPage}
import com.gu.identity.integration.test.util.User
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class ProfileSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def goToEditProfilePage(pageWithSignInModule: ContainerWithSigninModulePage): EditProfilePage = {
    logger.step("Going to the edit profile page")
    val profileNavMenu = pageWithSignInModule.signInModule().clickSignInLinkWhenLoggedIn()
    profileNavMenu.clickEditProfile()
  }

  def goToEditAccountDetailsPage(pageWithSignInModule: ContainerWithSigninModulePage): EditAccountDetailsModule = {
    logger.step("Going to the edit account details page")
    val editProfilePage = goToEditProfilePage(pageWithSignInModule)
    editProfilePage.clickEditAccountDetailsTab()
  }

  def changeEmail(editAccountDetailsModule: EditAccountDetailsModule): String = {
    logger.step("Changing account email")
    editAccountDetailsModule.enterEmailAddress(User.generateRandomEmail)
    editAccountDetailsModule.saveChanges()
    waitForPageToBeLoaded
    editAccountDetailsModule.getAllValidationErrorElements() should be ('empty)
    editAccountDetailsModule.getEmailAddress()
  }
}
