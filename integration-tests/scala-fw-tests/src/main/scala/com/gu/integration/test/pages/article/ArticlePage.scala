package com.gu.integration.test.pages.article

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.integration.test.pages.common.MostPopularModule
import com.gu.integration.test.pages.common.ParentPage
import com.gu.integration.test.util.ElementLoader.findByTestAttribute
import com.gu.integration.test.pages.common.RelatedContentModule
import com.gu.integration.test.pages.common.AdvertiseModule

class ArticlePage(implicit driver: WebDriver) extends ParentPage {

  val articleRootElement: WebElement = findByTestAttribute("article-root")
  def topBannerAdElement: WebElement = findByTestAttribute("ad-slot-top-above-nav")

  def mostPopularModule() = {
    new MostPopularModule
  }

  def relatedContentModule() = {
    new RelatedContentModule
  }

  def topBannerAdModule(): AdvertiseModule = {
    new AdvertiseModule(topBannerAdElement)
  }
}