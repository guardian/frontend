package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages.{ContainerWithSigninModulePage, RegisterPage, SignInPage}
import com.gu.identity.integration.test.util.User
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class RegisterSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def registerNewTempUser(registerPage: RegisterPage): User = {
    logger.step("Creating a new random user")
    val randomUser = User.generateRandomUser()
    registerPage.enterEmail(randomUser.email)
    registerPage.enterPwd(randomUser.pwd)
    registerPage.enterUsername(randomUser.userName)
    registerPage.createButton.click()
    randomUser
  }
}
