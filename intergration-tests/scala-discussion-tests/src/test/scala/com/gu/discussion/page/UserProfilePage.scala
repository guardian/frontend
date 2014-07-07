package com.gu.discussion.page

import com.gu.automation.support.TestLogger
import com.gu.automation.support.page.Element
import com.gu.discussion.support.ByExt
import org.openqa.selenium.{By, WebDriver}


case class UserProfilePage(implicit driver: WebDriver, logger: TestLogger){

  private def commentsTab = Element(ByExt.dataTypeStream("discussions"))
  private def repliesTab = Element(ByExt.dataTypeStream("replies"))
  private def featuredTab = Element(ByExt.dataTypeStream("picks"))
  private def profileName = Element(By.className("user-profile__name"))
  private def activityItemTitle = Element(By.className("user-profile__name"))
  private def activityStreamEmpty = Element(By.className("user-profile__name"))


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
    if (activityItemTitle.safeGet.map(_.isDisplayed) != Some(true)
      && activityStreamEmpty.safeGet.map(_.isDisplayed) != Some(true)) {
      throw new RuntimeException("Content not loaded!")
    }
    this
  }

}
