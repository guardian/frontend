package com.gu.integration.test.pages.common

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

class MostPopularModule(implicit driver: WebDriver) extends ParentPage {

  val mostPopularRootElement: WebElement = findByTestAttribute("right-most-popular")
}