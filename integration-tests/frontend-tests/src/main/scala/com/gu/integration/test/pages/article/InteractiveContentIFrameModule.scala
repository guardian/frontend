package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.integration.test.util.ElementLoader
import com.gu.integration.test.util.ElementLoader.findByTestAttribute
import org.openqa.selenium.By

case class InteractiveContentIFrameModule(iframeContainer: WebElement)(implicit val driver: WebDriver) extends ParentPage with DisplayedImages {

  val rootElement: WebElement = driver.switchTo().frame(iframeContainer).findElement(By.cssSelector("div"))

  def dispose() = driver.switchTo().defaultContent()
}