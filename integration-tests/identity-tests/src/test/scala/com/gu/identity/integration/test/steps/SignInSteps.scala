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

    val loginCookieSc = driver.manage().getCookieNamed("SC_GU_U")
    loginCookieSc.getValue should not be empty
  }

  def signInUsingFaceBook(signInPage: SignInPage) = {
    logger.step(s"I am signing in using FaceBook")
    val faceBookSignInPage = signInPage.clickFaceBookSignInButton()
    faceBookSignInPage.enterEmail(get("faceBookEmail"))
    faceBookSignInPage.enterPwd(get("faceBookPwd"))
    faceBookSignInPage.loginInButton.click()
  }

  def checkLoggedInThroughFaceBook() = {
    logger.step(s"Checking that user is logged in through Facebook")
    val loginCookieFB1 = driver.manage().getCookieNamed("GU_MI")
    loginCookieFB1.getValue should not be empty

    val loginCookieFB2 = driver.manage().getCookieNamed("GU_ME")
    loginCookieFB2.getValue should not be empty
  }
}
