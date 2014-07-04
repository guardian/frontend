package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.By.cssSelector
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.page.common.FaciaGalleryItem._
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

object FaciaGalleryItem {

  val GALLERY_ITEM_CONTAINER_ID = "gallery-item-container"

  val GALLERY_PICTURE_ID = "gallery-picture"
}

class FaciaGalleryItem(rootElement: WebElement)(implicit var driver: WebDriver) extends FrontsParentPage() {

  private def pictureElement = findByTestAttribute(GALLERY_PICTURE_ID, rootElement)

  override def isDisplayed() = {
    existsAndDisplayed(rootElement)
  }

  def clickPicture(): GalleryOverlay = {
    existsAndDisplayed(pictureElement)
    pictureElement.click()
    new GalleryOverlay
  }
}