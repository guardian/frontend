package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.identity.integration.test.pages.{ContainerWithSigninModulePage, EditAccountDetailsModule}
import com.gu.identity.integration.test.steps.{SignInSteps, UserSteps}
import com.gu.identity.integration.test.util.User
import com.gu.identity.integration.test.util.User._
import com.gu.integration.test.steps.BaseSteps
import com.gu.integration.test.util.UserConfig._
import org.openqa.selenium.WebDriver
import org.scalatest.EitherValues


class UserTests extends IdentitySeleniumTestSuite with EitherValues {

  feature("Create and changing a User") {

    scenarioWeb("should not be able to create user with existing user name") { implicit driver: WebDriver =>
      val validationErrors = UserSteps().createUserWithUserName(get("loginName")).left.value
      validationErrors.size should be(1)
      validationErrors.head.errorText.contains("username") should be(true)
    }

    scenarioWeb("should be able to change email address") { implicit driver: WebDriver =>
      val userBeforeChange: User = UserSteps().createRandomBasicUser().right.value
      val editAccountDetailsModule = UserSteps().checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange)

      checkEmailValidation(editAccountDetailsModule)

      val changedEmail = UserSteps().changeEmail(editAccountDetailsModule).right.value
      changedEmail should not be userBeforeChange.email
    }

    def checkEmailValidation(editAccountDetailsModule: EditAccountDetailsModule) = { implicit driver: WebDriver =>
      val invalidEmail = generateRandomAlphaNumericString(7)
      val validationErrors = UserSteps().changeEmailTo(invalidEmail, editAccountDetailsModule).left.value
      validationErrors.size should be(1)
      validationErrors.head.errorText.contains("email") should be(true)
    }

    scenarioWeb("should be able to set and change first and last name") { implicit driver: WebDriver =>
      val userBeforeChange: User = UserSteps().createRandomBasicUser().right.value
      val editAccountDetailsModule = UserSteps().checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange)

      val userWithChangedName = UserSteps().changeFirstAndLastName(editAccountDetailsModule)

      userWithChangedName.firstName should not be userBeforeChange.firstName
      userWithChangedName.lastName should not be userBeforeChange.lastName
    }

    scenarioWeb("should be able to set and change address") { implicit driver: WebDriver =>
      val userBeforeChange: User = UserSteps().createRandomBasicUser().right.value
      val editAccountDetailsModule = UserSteps().checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange)

      val userWithChangedAddress = UserSteps().changeAddress(editAccountDetailsModule)

      userWithChangedAddress.addrLine1 should not be userBeforeChange.addrLine1
      userWithChangedAddress.addrLine2 should not be userBeforeChange.addrLine2
      userWithChangedAddress.town should not be userBeforeChange.town
      userWithChangedAddress.county should not be userBeforeChange.county
      userWithChangedAddress.postCode should not be userBeforeChange.postCode
      userWithChangedAddress.country should not be userBeforeChange.country
    }

    scenarioWeb("should be able to change password") { implicit driver: WebDriver =>
      val userBeforeChange: User = UserSteps().createRandomBasicUser().right.value
      val containerWithSignInModulePage = SignInSteps().checkUserIsLoggedIn(userBeforeChange)

      val newPasswordAndStartPage = UserSteps().changePassword(containerWithSignInModulePage, userBeforeChange)
      val startPage = newPasswordAndStartPage.containerWithSignInpage
      val newPassword = newPasswordAndStartPage.newPwd

      SignInSteps().signOut(startPage)
      SignInSteps().checkUserIsNotLoggedIn(userBeforeChange.userName)

      SignInSteps().signInWith(userBeforeChange.email, newPassword)
      SignInSteps().checkUserIsLoggedIn(userBeforeChange.userName)
    }

    scenarioWeb("should be able to reset password") { implicit driver: WebDriver =>
      BaseSteps().goToStartPage()
      SignInSteps().signInUsingFaceBook()
      UserSteps().requestToResetPassword(new ContainerWithSigninModulePage())

      val resetPwdPage = UserSteps().checkResetPasswordMailAndGoToResetPwdPage()

      UserSteps().resetPassword(resetPwdPage)
    }
  }
}
