package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.integration.test.util.ElementLoader.findByTestAttribute

class PopularInModule(implicit val driver: WebDriver) extends ParentPage with DisplayedLinks {
  val rootElement: WebElement = findByTestAttribute("popular-in")
}