package com.gu.fronts.integration.test.page.common

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

  override def assertIsDisplayed() = {
    assertExistsAndDisplayed(galleryGridButton)
  }

  def clickGalleryGridMode(): GalleryOverlay = {
    assertExistsAndDisplayed(galleryGridButton)
    galleryGridButton.click()
    assertExistsAndDisplayed(galleryFullButton)
    this
  }

  def clickGalleryFullMode(): GalleryOverlay = {
    assertExistsAndDisplayed(galleryFullButton)
    galleryFullButton.click()
    assertExistsAndDisplayed(galleryGridButton)
    this
  }

  def clickNextPicture(): GalleryOverlay = {
    assertExistsAndDisplayed(galleryNextButton)
    galleryNextButton.click()
    this
  }

  def getDisplayedImage(): WebElement = {
    galleryImages.find(_.isDisplayed) getOrElse {
      throw new RuntimeException("Could not find a displayed Gallery Overlay picture item with attribute [" + TestAttributeName + "=gallery-image-item]")
    }
  }

  def close(): NetworkFrontPage = {
    assertExistsAndDisplayed(closeOverlayButton)
    closeOverlayButton.click()
    new NetworkFrontPage
  }
}