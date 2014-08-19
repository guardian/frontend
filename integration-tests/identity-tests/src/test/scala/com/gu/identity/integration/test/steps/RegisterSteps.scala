package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages.RegisterPage
import com.gu.identity.integration.test.util.User
import org.openqa.selenium.WebDriver
import org.scalatest.Matchers

case class RegisterSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def registerNewTempUser(registerPage: RegisterPage): User = {
    logger.step("Creating a new random user")
    val randomUser = User.generateRandomUser()
    registerPage.enterEmail(randomUser.email)
    enterPasswordIfSet(registerPage, randomUser)
    registerPage.enterUsername(randomUser.userName)
    registerPage.createButton.click()
    randomUser
  }

  def enterPasswordIfSet(registerPage: RegisterPage, randomUser: User) {
    for (password <- randomUser.pwd)
      registerPage.enterPwd(password)
  }
}
