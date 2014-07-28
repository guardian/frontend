package com.gu.integration.test.pages.article

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.ui.ExpectedConditions.not
import org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf

import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.pages.common.PopularInModule
import com.gu.integration.test.util.ElementLoader.findByTestAttribute
import com.gu.integration.test.util.ElementLoader.waitUntil

class LiveBlogPage(implicit driver: WebDriver) extends ParentPage {
  val liveBlogRootElement: WebElement = findByTestAttribute("live-blog")
  def expandButton: WebElement = findByTestAttribute("article-expand")
  def liveBlogBlocks: WebElement = findByTestAttribute("live-blog-blocks")

  def expandButtonNotPresent(): Boolean = {
    waitUntil(not(visibilityOf(expandButton)))
  }

  def popularInModule() = {
    new PopularInModule
  }
}