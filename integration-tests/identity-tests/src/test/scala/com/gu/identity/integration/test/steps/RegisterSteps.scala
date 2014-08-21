package com.gu.identity.integration.test.steps

import com.gu.automation.support.TestLogging
import com.gu.identity.integration.test.pages.RegisterPage
import com.gu.identity.integration.test.util.{FormError, User}
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.{WebDriver, WebElement}
import org.scalatest.Matchers

case class RegisterSteps(implicit driver: WebDriver) extends TestLogging with Matchers {

  def registerNewTempUser(registerPage: RegisterPage): Either[List[FormError], User] = {
    logger.step("Creating a new random user")
    val randomGeneratedUser = User.generateRandomUser()
    registerNewTempUserUsing(registerPage, randomGeneratedUser)
  }

  def registerUserWithUserName(registerPage: RegisterPage, userName:String): Either[List[FormError], User] = {
    logger.step("Creating a new random user")
    val randomGeneratedUser = User.generateRandomUserWith(userName)
    registerNewTempUserUsing(registerPage, randomGeneratedUser)
  }

  def registerNewTempUserUsing(registerPage: RegisterPage, user:User): Either[List[FormError], User] = {
    logger.step("Creating a new user")
    registerPage.enterEmail(user.email)
    enterPasswordIfSet(registerPage, user)
    registerPage.enterUsername(user.userName)
    registerPage.createButton.click()

    waitForPageToBeLoaded

    val userFormErrors = registerPage.getAllValidationFormErrors()

    if (userFormErrors.nonEmpty) {
      Left(userFormErrors)
    } else {
      Right(user)
    }
  }

  private def enterPasswordIfSet(registerPage: RegisterPage, randomUser: User) {
    for (password <- randomUser.pwd)
      registerPage.enterPwd(password)
  }
}
