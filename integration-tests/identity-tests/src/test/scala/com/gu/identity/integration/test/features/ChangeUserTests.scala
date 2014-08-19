package com.gu.identity.integration.test.features

import com.gu.identity.integration.test.IdentitySeleniumTestSuite
import com.gu.identity.integration.test.steps.UserSteps
import com.gu.identity.integration.test.util.User
import org.openqa.selenium.WebDriver

class ChangeUserTests extends IdentitySeleniumTestSuite {

  feature("Change profile") {
    scenarioWeb("should be able to change email address") { implicit driver: WebDriver =>
      val userBeforeChange: User = UserSteps().createRandomBasicUser()
      val editAccountDetailsModule = UserSteps().checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange)

      val changedEmail = UserSteps().changeEmail(editAccountDetailsModule)

      changedEmail should not be userBeforeChange.email
    }

    scenarioWeb("should be able to set and change first and last name") { implicit driver: WebDriver =>
      val userBeforeChange: User = UserSteps().createRandomBasicUser()
      val editAccountDetailsModule = UserSteps().checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange)

      val userWithChangedName = UserSteps().changeFirstAndLastName(editAccountDetailsModule)

      userWithChangedName.firstName should not be userBeforeChange.firstName
      userWithChangedName.lastName should not be userBeforeChange.lastName
    }

    scenarioWeb("should be able to set and change address") { implicit driver: WebDriver =>
      val userBeforeChange: User = UserSteps().createRandomBasicUser()
      val editAccountDetailsModule = UserSteps().checkUserIsLoggedInAndGoToAccountDetails(userBeforeChange)

      val userWithChangedName = UserSteps().changeAddress(editAccountDetailsModule)

      userWithChangedName.addrLine1 should not be userBeforeChange.addrLine1
      userWithChangedName.addrLine2 should not be userBeforeChange.addrLine2
      userWithChangedName.town should not be userBeforeChange.town
      userWithChangedName.county should not be userBeforeChange.county
      userWithChangedName.postCode should not be userBeforeChange.postCode
      userWithChangedName.country should not be userBeforeChange.country
    }
  }
}
