package com.gu.integration.test.pages.article

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.integration.test.pages.common.AdvertiseModule
import com.gu.integration.test.pages.common.DiscussionsContainerModule
import com.gu.integration.test.pages.common.MostPopularModule
import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.pages.common.RelatedContentModule
import com.gu.integration.test.util.ElementLoader.findByTestAttribute

class ArticlePage(implicit driver: WebDriver) extends ParentPage {

  val articleRootElement: WebElement = findByTestAttribute("article-root")
  
  def topBannerAdElement: WebElement = findByTestAttribute("ad-slot-top-above-nav")
  def rightHandAdElement: WebElement = findByTestAttribute("ad-slot-right")
  def inlineAdElement: WebElement = findByTestAttribute("ad-slot-inline1")
  def bottomMerchandisingAdElement: WebElement = findByTestAttribute("ad-slot-merchandising")

  def mostPopularModule() = {
    new MostPopularModule
  }

  def relatedContentModule() = {
    new RelatedContentModule
  }

  def topBannerAdModule(): AdvertiseModule = {
    new AdvertiseModule(topBannerAdElement)
  }

  def rightHandAdModule(): AdvertiseModule = {
    new AdvertiseModule(rightHandAdElement)
  }

  def inlineAdModule(): AdvertiseModule = {
    new AdvertiseModule(inlineAdElement)
  }

  def bottomMerchandisingAdModule(): AdvertiseModule = {
    new AdvertiseModule(bottomMerchandisingAdElement)
  }
  
  def commentsContainerModule(): DiscussionsContainerModule = {
    new DiscussionsContainerModule()
  }
}