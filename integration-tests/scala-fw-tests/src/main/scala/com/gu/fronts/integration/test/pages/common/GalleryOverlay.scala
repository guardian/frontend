package com.gu.fronts.integration.test.page.common

import scala.collection.JavaConversions.asScalaBuffer
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.pages.common.FrontsParentPage

class GalleryOverlay(implicit var driver: WebDriver) extends FrontsParentPage() {

  private def galleryGridButton: WebElement = findByTestAttribute("gallery-grid")

  private def galleryFullButton: WebElement = findByTestAttribute("gallery-full")

  private def galleryNextButton: WebElement = findByTestAttribute("gallery-next")

  private def galleryImages: List[WebElement] = findAllByTestAttribute("gallery-image-item")

  private def closeOverlayButton: WebElement = findByTestAttribute("close-overlay")

  override def isDisplayed() = {
    existsAndDisplayed(galleryGridButton)
  }

  def clickGalleryGridMode(): GalleryOverlay = {
    existsAndDisplayed(galleryGridButton)
    galleryGridButton.click()
    existsAndDisplayed(galleryFullButton)
    this
  }

  def clickGalleryFullMode(): GalleryOverlay = {
    existsAndDisplayed(galleryFullButton)
    galleryFullButton.click()
    existsAndDisplayed(galleryGridButton)
    this
  }

  def clickNextPicture(): GalleryOverlay = {
    existsAndDisplayed(galleryNextButton)
    galleryNextButton.click()
    this
  }

  def getDisplayedImage(): WebElement = {
    for (image <- galleryImages) {
      if (image.isDisplayed()) {
        return image
      }
    }
    throw new RuntimeException("Could not find a displayed Gallery Overlay picture item with attribute [" + TEST_ATTR_NAME + "=gallery-image-item")
  }

  def close(): NetworkFrontPage = {
    existsAndDisplayed(closeOverlayButton)
    closeOverlayButton.click()
    new NetworkFrontPage
  }
}