package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.support.ui.ExpectedConditions._
import org.openqa.selenium.{By, WebDriver, WebElement}

/**
 * Do not confuse this with the sign in page. This is only the module which sits at the top of most frontend pages
 */
class ProfileNavMenu(implicit driver: WebDriver) extends ParentPage {
  val menuList: WebElement = findByTestAttribute("nav-popup-profile")

  def clickEditProfile(): EditProfilePage = {
    waitUntil(visibilityOf(menuList))
    val editProfileMenuLink = menuList.findElement(By.cssSelector("a[data-link-name='Edit profile']"))
    editProfileMenuLink.click()
    new EditProfilePage()
  }

}