package com.gu.integration.test.pages.common

import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.integration.test.util.ElementLoader
import com.gu.integration.test.util.ElementLoader.findByTestAttribute

case class AdvertiseModule(rootElement: WebElement)(implicit val driver: WebDriver) extends ParentPage with DisplayedImages
  with DisplayedLinks {
  def adLabel: WebElement = findByTestAttribute("ad-slot-label")

  /**
   * Have to call this method, for ads nested inside IFrames, before checking the content
   */
  def advertiseIFrameModule(): AdvertiseIFrameModule = {
    val iframeElements = ElementLoader.displayedIFrames(rootElement)
    if (iframeElements.size != 1) {
      throw new RuntimeException(s"Unexpected number of iframes ${iframeElements.size} inside advertise element: ${rootElement}")
    }
    new AdvertiseIFrameModule(iframeElements.last)
  }
}