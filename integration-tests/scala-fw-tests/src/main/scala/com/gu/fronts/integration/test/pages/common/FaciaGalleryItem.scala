package com.gu.fronts.integration.test.page.common

import org.openqa.selenium.By.cssSelector
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.page.common.FaciaGalleryItem._
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

object FaciaGalleryItem {

  val GalleryItemContainerId = "gallery-item-container"

  val GalleryPictureId = "gallery-picture"
}

class FaciaGalleryItem(rootElement: WebElement)(implicit var driver: WebDriver) extends FrontsParentPage() {

  private def pictureElement = findByTestAttribute(GalleryPictureId, rootElement)

  override def assertIsDisplayed() = {
    assertExistsAndDisplayed(rootElement)
  }

  def clickPicture(): GalleryOverlay = {
    assertExistsAndDisplayed(pictureElement)
    pictureElement.click()
    new GalleryOverlay
  }
}