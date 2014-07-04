package com.gu.discussion.page

import com.gu.automation.support.{Wait}
import com.gu.discussion.support.ByExt
import org.openqa.selenium.support.ui.ExpectedConditions
import org.openqa.selenium.{By, WebDriver}


case class UserProfilePage(implicit driver: WebDriver) {

  private def commentsTab = driver.findElement(ByExt.dataTypeStream("discussions"))
  private def repliesTab = driver.findElement(ByExt.dataTypeStream("replies"))
  private def featuredTab = driver.findElement(ByExt.dataTypeStream("picks"))
  private def profileInfo = driver.findElement(By.className("disc-profile__user-info"))
  private def profileName = driver.findElement(By.className("user-profile__name"))

  def getUserProfileName: String = {
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
    //Need this wait for the page to reload/refresh which is actioned with javascript

    //Need to wait for elements to appear here

    //Wait().until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("activity-item__title")))

    /*val des =  driver.findElement(By.className("disc-profile__user-info"))

    if(des.exists){
      Wait().until(ExpectedConditions.presenceOfElementLocated(By.className("disc-profile__user-info")))
    }else {
      Wait().until(ExpectedConditions.presenceOfElementLocated(By.className("activity-stream__empty")))

    }*/

  }


}
