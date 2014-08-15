package com.gu.identity.integration.test.steps

import com.gu.automation.support.{Config, TestLogging}
import com.gu.identity.integration.test.pages.{ContainerWithSigninModulePage, SignInPage}
import com.gu.integration.test.util.UserConfig._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class SignInSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def openSignInPage(): SignInPage = {
    new ContainerWithSigninModulePage().signInModule().clickSignInLink()
  }

  def signIn(signInPage: SignInPage) = {
    logger.step(s"I am signing in using credentials")
    signInPage.enterEmail(Config().getLoginEmail())
    signInPage.enterPwd(Config().getLoginPassword())
    signInPage.signInButton.click()
  }

  def checkUserIsLoggedIn(expectedLoginName: String) = {
    logger.step(s"Checking that user is logged in")
    val loginName = new ContainerWithSigninModulePage().signInModule().signInName.getText
    loginName should be(expectedLoginName)

    val loginCookie = driver.manage().getCookieNamed("GU_U")
    loginCookie.getValue should not be empty
  }

  def checkUserIsLoggedInSecurely() = {
    val loginCookieSecure = driver.manage().getCookieNamed("SC_GU_U")
    loginCookieSecure.getValue should not be empty
  }

  def signInUsingFaceBook(signInPage: SignInPage) = {
    logger.step(s"I am signing in using FaceBook")
    val faceBookSignInPage = signInPage.clickFaceBookSignInButton()
    faceBookSignInPage.enterEmail(get("faceBookEmail"))
    faceBookSignInPage.enterPwd(get("faceBookPwd"))
    faceBookSignInPage.loginInButton.click()
  }

  def signInUsingGoogle(signInPage: SignInPage) = {
    logger.step(s"I am signing in using FaceBook")
    val googleSignInPage = signInPage.clickGoogleSignInButton()
    googleSignInPage.enterEmail(get("googleEmail"))
    googleSignInPage.enterPwd(get("googlePwd"))
    googleSignInPage.loginInButton.click()
  }

  def checkLoggedInThroughSocialMedia() = {
    logger.step(s"Checking that user is logged in through Social Media")
    val loginCookieMI = driver.manage().getCookieNamed("GU_MI")
    loginCookieMI.getValue should not be empty

    val loginCookieME = driver.manage().getCookieNamed("GU_ME")
    loginCookieME.getValue should not be empty
  }
}
