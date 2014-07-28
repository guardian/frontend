package com.gu.integration.test.pages.article

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.integration.test.pages.common.MostPopularModule
import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader.findByTestAttribute
import com.gu.integration.test.pages.common.RelatedContentModule
import com.gu.integration.test.pages.common.AdvertiseModule
import org.openqa.selenium.By
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.support.ui.ExpectedConditions._

class LiveBlogPage(implicit driver: WebDriver) extends ParentPage {
  val liveBlogRootElement: WebElement = findByTestAttribute("live-blog")
  def expandButton: WebElement = findByTestAttribute("article-expand")
  def liveBlogBlocks: WebElement = findByTestAttribute("live-blog-blocks")
  
  def expandButtonNotPresent(): Boolean = {
    waitUntil(not(visibilityOf(expandButton)))
  }
}