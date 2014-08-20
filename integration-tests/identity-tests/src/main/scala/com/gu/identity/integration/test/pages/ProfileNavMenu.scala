package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import com.gu.integration.test.util.PageLoader._
import org.openqa.selenium.support.ui.ExpectedConditions._
import org.openqa.selenium.{By, WebDriver, WebElement}

/**
 * Do not confuse this with the sign in page. This is only the module which sits at the top of most frontend pages
 */
class ProfileNavMenu(implicit driver: WebDriver) extends ParentPage {
  val menuList: WebElement = findByTestAttribute("nav-popup-profile")

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
    waitForPageToBeLoaded
    lazy val pageWithSignIn = new ContainerWithSigninModulePage()
    goTo(pageWithSignIn, frontsBaseUrl, useBetaRedirect=false)
  }

  def clickMenuElement(dataLinkName: String) = {
    waitUntil(visibilityOf(menuList))
    val menuElement = menuList.findElement(By.cssSelector(s"a[data-link-name='$dataLinkName']"))
    menuElement.click()
  }
}