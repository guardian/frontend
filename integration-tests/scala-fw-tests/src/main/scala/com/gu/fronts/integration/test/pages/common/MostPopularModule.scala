package com.gu.fronts.integration.test.page.nwfront

import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement

import com.gu.fronts.integration.test.pages.common.FrontsParentPage

class MostPopularModule(implicit driver: WebDriver) extends FrontsParentPage() {

  val mostPopularRootElement: WebElement = findByTestAttribute("right-most-popular")
}