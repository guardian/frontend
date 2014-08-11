package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages.ContainerWithSigninModulePage
import com.gu.integration.test.util.UserConfig._
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class SignInSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def signIn() = {
    val signInPage = new ContainerWithSigninModulePage().SignInModule().clickSignInLink()
    signInPage.enterEmail(get("loginEmail"))
    signInPage.enterPwd(get("loginPwd"))
    signInPage.signInButton.click()
  }

  def checkUserIsLoggedIn() = {
    val loginName = new ContainerWithSigninModulePage().SignInModule().signInName.getText
    loginName should be(get("loginName"))

    val loginCookie = driver.manage().getCookieNamed("GU_U")
    loginCookie.getValue should not be empty
  }
}
