package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.support.ui.ExpectedConditions._
import org.openqa.selenium.{WebDriver, WebElement}

class EditProfilePage(implicit driver: WebDriver) extends ParentPage {
  private def editAccountDetailsTab: WebElement = findByTestAttribute("edit-account-details")

  def clickEditAccountDetailsTab() = {
    waitUntil(visibilityOf(editAccountDetailsTab))
    editAccountDetailsTab.click()
    new EditAccountDetailsModule()
  }
}
