package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{By, WebDriver, WebElement}

class FaceBookSignInPage(implicit driver: WebDriver) extends ParentPage {
  private def emailInputField: WebElement = driver.findElement(By.id("email"))
  private def pwdInputField: WebElement = driver.findElement(By.id("pass"))
  def loginInButton: WebElement = driver.findElement(By.name("login"))

  def enterEmail(email: String) {
    emailInputField.sendKeys(email)
    this
  }

  def enterPwd(pwd: String) {
    pwdInputField.sendKeys(pwd)
    this
  }
}
