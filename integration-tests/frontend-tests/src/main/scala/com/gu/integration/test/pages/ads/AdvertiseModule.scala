package com.gu.integration.test.pages.common

import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.integration.test.util.ElementLoader
import com.gu.integration.test.util.ElementLoader._

case class AdvertiseModule(rootElement: WebElement)(implicit val driver: WebDriver) extends ParentPage with DisplayedImages
  with DisplayedLinks {
  def adLabel: WebElement = findByTestAttribute("ad-slot-label")

  /**
   * Have to call this method, for ads nested inside IFrames, before checking the content
   */
  def advertiseIFrameModule(): AdvertiseIFrameModule = {
    new AdvertiseIFrameModule(firstDisplayedIframe(rootElement))
  }
}