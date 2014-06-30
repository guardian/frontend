package com.gu.fronts.integration.test.page.common

import java.util.List

import scala.collection.JavaConversions.asScalaBuffer

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.TEST_ATTR_NAME
import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.util.FrontsParentPage
import com.gu.fronts.integration.test.page.util.PageElementHelper.existsAndDisplayed

class GalleryOverlay(webDriver: WebDriver) extends FrontsParentPage(webDriver) {

  @FindByTestAttribute(using = "gallery-grid")
  private var galleryGridButton: WebElement = _

  @FindByTestAttribute(using = "gallery-full")
  private var galleryFullButton: WebElement = _

  @FindByTestAttribute(using = "gallery-next")
  private var galleryNextButton: WebElement = _

  @FindByTestAttribute(using = "gallery-image-item")
  private var galleryImages: List[WebElement] = _

  @FindByTestAttribute(using = "close-overlay")
  private var closeOverlayButton: WebElement = _

  override def isDisplayed(): Boolean = {
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

  def clickNextGallery(): GalleryOverlay = {
    existsAndDisplayed(galleryNextButton)
    galleryNextButton.click()
    this
  }

  def getDisplayedImage(): WebElement = {
    var displayedImage: WebElement = null
    for (image <- galleryImages if image.isDisplayed) {
      displayedImage = image
      //break
    }
    if (displayedImage == null) {
      throw new RuntimeException("Could not find a displayed Gallery Overlay picture item with attribute [" + TEST_ATTR_NAME + "=gallery-image-item")
    }
    displayedImage
  }

  def close(): NetworkFrontPage = {
    existsAndDisplayed(closeOverlayButton)
    closeOverlayButton.click()
    pageFactory.initPage(webDriver, classOf[NetworkFrontPage])
  }
}