package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import org.openqa.selenium.{WebDriver, WebElement}

/**
 * Any page which contains the login module
 */
class ContainerWithSigninModulePage(implicit driver: WebDriver) extends ParentPage {

  def signInModule(): SignInModule = {
    new SignInModule()
  }
}