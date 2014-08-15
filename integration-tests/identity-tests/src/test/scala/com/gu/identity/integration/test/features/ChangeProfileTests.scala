package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.identity.integration.test.steps.{ProfileSteps, RegisterSteps, SignInSteps}
import com.gu.integration.test.steps.BaseSteps
import org.openqa.selenium.WebDriver

class ChangeProfileTests extends IdentitySeleniumTestSuite {

  feature("Change profile") {
    scenarioWeb("should be able to change email address") { implicit driver: WebDriver =>
      //given there is a user in the system
      BaseSteps().goToStartPage(useBetaRedirect = false)
      val registerPage = SignInSteps().clickSignInLink().clickRegisterNewUserLink()
      val userBeforeChange = RegisterSteps().registerNewTempUser(registerPage)

      //when the user is logged in
      val startPage = SignInSteps().checkUserIsLoggedIn(userBeforeChange)
      //and his email changed
      val editAccountDetailsModule = ProfileSteps().goToEditAccountDetailsPage(startPage)
      val changedEmail = ProfileSteps().changeEmail(editAccountDetailsModule)

      //then email should have changed
      changedEmail should not be userBeforeChange.email
    }
  }
}
