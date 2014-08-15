package com.gu.identity.integration.test.steps

import com.gu.automation.support.{Config, TestLogging}
import com.gu.identity.integration.test.pages.{ContainerWithSigninModulePage, SignInPage}
import com.gu.identity.integration.test.util.User
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.UserConfig._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class SignInSteps(implicit driver: WebDriver) extends TestLogging with Matchers {
  private val LoginCookie: String = "GU_U"
  private val SecureLoginCookie: String = "SC_GU_U"
  private val SocialMediaCookieMI: String = "GU_MI"
  private val SocialMediaCookieME: String = "GU_ME"

  def clickSignInLink(): SignInPage = {
    new ContainerWithSigninModulePage().signInModule().clickSignInLink()
  }

  def signIn(signInPage: SignInPage) = {
    logger.step(s"Signing in using credentials")
    signInPage.enterEmail(Config().getLoginEmail())
    signInPage.enterPwd(Config().getLoginPassword())
    signInPage.signInButton.click()
  }

  def checkUserIsLoggedIn(user: User): ContainerWithSigninModulePage = {
    logger.step(s"Signing in using api")
    BaseSteps().goToStartPage(useBetaRedirect = false)
    checkUserIsLoggedIn(user.userName)
    new ContainerWithSigninModulePage()
  }

  def checkUserIsLoggedIn(expectedLoginName: String) = {
    logger.step(s"Checking that user is logged in")
    val loginName = new ContainerWithSigninModulePage().signInModule().signInName.getText
    loginName should be(expectedLoginName)

    val loginCookie = driver.manage().getCookieNamed(LoginCookie)
    loginCookie.getValue should not be empty
  }

  def checkUserIsLoggedInSecurely() = {
    //have to go to a https link because on some browsers you can only get secure cookies on https pages
    val currentUrl = driver.getCurrentUrl
    driver.get(get("secureEditProfileLink"))

    val secureLoginCookie = driver.manage().getCookieNamed(SecureLoginCookie)
    secureLoginCookie.getValue should not be empty

    //go back to previous link
    driver.get(currentUrl)
  }

  def signInUsingFaceBook(signInPage: SignInPage) = {
    logger.step(s"Signing in using FaceBook")
    val faceBookSignInPage = signInPage.clickFaceBookSignInButton()
    faceBookSignInPage.enterEmail(get("faceBookEmail"))
    faceBookSignInPage.enterPwd(get("faceBookPwd"))
    faceBookSignInPage.loginInButton.click()
  }

  def signInUsingGoogle(signInPage: SignInPage) = {
    logger.step(s"Signing in using FaceBook")
    val googleSignInPage = signInPage.clickGoogleSignInButton()
    googleSignInPage.enterEmail(get("googleEmail"))
    googleSignInPage.enterPwd(get("googlePwd"))
    googleSignInPage.loginInButton.click()
  }

  def checkLoggedInThroughSocialMedia() = {
    logger.step(s"Checking that user is logged in through Social Media")
    val loginCookieMI = driver.manage().getCookieNamed(SocialMediaCookieMI)
    loginCookieMI.getValue should not be empty

    val loginCookieME = driver.manage().getCookieNamed(SocialMediaCookieME)
    loginCookieME.getValue should not be empty
  }
}
