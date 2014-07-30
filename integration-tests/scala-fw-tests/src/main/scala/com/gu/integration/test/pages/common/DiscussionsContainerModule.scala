package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.integration.test.util.ElementLoader.findByTestAttribute

class DiscussionsContainerModule(implicit driver: WebDriver) extends ParentPage {
  val commentsContainer: WebElement = findByTestAttribute("comments-container")
  def commentsViewType: WebElement = findByTestAttribute("comment-view-type")
  def viewAllComments: WebElement = findByTestAttribute("view-all-comments")
}