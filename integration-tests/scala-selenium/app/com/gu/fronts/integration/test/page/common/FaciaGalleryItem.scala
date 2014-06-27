package com.gu.fronts.integration.test.page.common

import com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.byTestAttribute
import com.gu.fronts.integration.test.page.util.PageElementHelper.findElementBy
import org.openqa.selenium.By.cssSelector
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.page.util.AbstractParentPage
import FaciaGalleryItem._
//remove if not needed
import scala.collection.JavaConversions._

object FaciaGalleryItem {

  val GALLERY_ITEM_CONTAINER_ID = "gallery-item-container"

  private val GALLERY_PICTURE_ID = "gallery-picture"
}

class FaciaGalleryItem(webDriver: WebDriver, containerTopElement: WebElement) extends AbstractParentPage(webDriver) {

  private var rootElement: WebElement = containerTopElement

  override def isDisplayed(): FaciaGalleryItem = {
    assertExistsAndDisplayed(rootElement)
    this
  }

  def clickPicture(): GalleryOverlay = {
    pictureElement().click()
    pageFactory.initPage(webDriver, classOf[GalleryOverlay])
  }

  private def pictureElement(): WebElement = {
    findElementBy(rootElement, cssSelector(byTestAttribute(GALLERY_PICTURE_ID)))
  }
}