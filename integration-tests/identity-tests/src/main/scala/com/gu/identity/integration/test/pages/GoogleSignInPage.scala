package com.gu.identity.integration.test.pages

import com.gu.integration.test.pages.common.ParentPage
import org.openqa.selenium.{By, WebDriver, WebElement}

class GoogleSignInPage(implicit driver: WebDriver) extends ParentPage {
  private def emailInputField: WebElement = driver.findElement(By.id("Email"))
  private def pwdInputField: WebElement = driver.findElement(By.id("Passwd"))
  def loginInButton: WebElement = driver.findElement(By.id("signIn"))

  def enterEmail(email: String) {
    emailInputField.sendKeys(email)
    this
  }

  def enterPwd(pwd: String) {
    pwdInputField.sendKeys(pwd)
    this
  }
}
