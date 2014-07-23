package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import com.gu.integration.test.util.ElementLoader
import com.gu.integration.test.util.ElementLoader.findByTestAttribute
import org.openqa.selenium.By

case class AdvertiseModule(rootElement: WebElement)(implicit val driver: WebDriver) extends ParentPage with DisplayedImages {
  //val mostPopularRootElement: WebElement = findByTestAttribute("right-most-popular")
	def adLabel: WebElement = findByTestAttribute("ad-slot-label")
	
	def advertiseIFrameContent(): AdvertiseIFrame = {
	  val iframeElements = ElementLoader.displayedIFrames(rootElement)
	  if(iframeElements.size != 1){
	    throw new RuntimeException(s"Unexpected number of iframes ${iframeElements.size} inside advertise element: ${rootElement}")
	  }
	  driver.switchTo().frame(iframeElements.last)
	  new AdvertiseIFrame(driver.findElement(By.cssSelector("div")))
	}
}