package com.gu.discussion.page

import com.gu.discussion.support.ByExt
import org.openqa.selenium.{By, WebDriver}


case class UserProfilePage(implicit driver: WebDriver) {

  private def commentsTab = driver.findElement(ByExt.dataTypeStream("discussions"))
  private def repliesTab = driver.findElement(ByExt.dataTypeStream("replies"))
  private def featuredTab = driver.findElement(ByExt.dataTypeStream("picks"))
  private def profileInfo = driver.findElement(By.className("disc-profile__user-info"))
  private def profileName = driver.findElement(By.className("user-profile__name"))

  def getUserProfileName = {
    val userProfileName = profileName.getText()
    userProfileName
  }

  def viewProfileComments(): UserProfilePage = {
    commentsTab.click()
    waitForUserHistoryToLoad()
    this
  }

  def viewProfileReplies(): UserProfilePage = {
    repliesTab.click()
    waitForUserHistoryToLoad()
    this
  }

  def viewProfileFeatured(): UserProfilePage =  {
    featuredTab.click()
    waitForUserHistoryToLoad()
    this
  }

  def waitForUserHistoryToLoad() = {
//    check if title comment title appears in the tab
    if (driver.findElement(By.cssSelector(".activity-item__title")).isDisplayed ) {
    } else (driver.findElement(By.cssSelector(".activity-stream__empty")).isDisplayed ) {
      logger.info("Comments not loading")
      println("Error - Comments not loading")
  }

}
