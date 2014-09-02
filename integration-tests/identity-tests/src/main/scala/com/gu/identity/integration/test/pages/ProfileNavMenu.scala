package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.support.ui.ExpectedConditions._
import org.openqa.selenium.{By, WebDriver, WebElement}

class ProfileNavMenu(implicit driver: WebDriver) extends ParentPage {
  private val menuList: WebElement = findByTestAttribute("nav-popup-profile")
  private def menuElement(dataLinkName: String): By = By.cssSelector(s"a[data-link-name='$dataLinkName']")

  def clickEditProfile(): EditProfilePage = {
    clickMenuElement("Edit profile")
    new EditProfilePage()
  }

  def clickChangePassword(): ChangePasswordPage = {
    clickMenuElement("Change password")
    new ChangePasswordPage()
  }

  def clickSignOut(): ContainerWithSigninModulePage = {
    clickMenuElement("Sign out")
    waitForPageToLoad
    lazy val pageWithSignIn = new ContainerWithSigninModulePage()
    goTo(pageWithSignIn, frontsBaseUrl, useBetaRedirect = false)
  }

  def clickMenuElement(dataLinkName: String) = {
    waitUntil(visibilityOf(menuList))
    menuList.findElement(menuElement(dataLinkName)).click()
  }
}