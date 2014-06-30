package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.By.cssSelector
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.byTestAttribute
import com.gu.fronts.integration.test.page.util.FrontsParentPage
import com.gu.fronts.integration.test.page.util.PageElementHelper.existsAndDisplayed
import com.gu.fronts.integration.test.page.util.PageElementHelper.findElementBy
import com.gu.fronts.integration.test.page.common.FaciaGalleryItem.GALLERY_PICTURE_ID

object FaciaGalleryItem {

  val GALLERY_ITEM_CONTAINER_ID = "gallery-item-container"

  private val GALLERY_PICTURE_ID = "gallery-picture"
}

class FaciaGalleryItem(webDriver: WebDriver, containerTopElement: WebElement) extends FrontsParentPage(webDriver) {

  private var rootElement: WebElement = containerTopElement

  override def isDisplayed(): Boolean = {
    existsAndDisplayed(rootElement)
  }

  def clickPicture(): GalleryOverlay = {
    pictureElement().click()
    pageFactory.initPage(webDriver, classOf[GalleryOverlay])
  }

  private def pictureElement(): WebElement = {
    findElementBy(rootElement, cssSelector(byTestAttribute(GALLERY_PICTURE_ID)))
  }
}