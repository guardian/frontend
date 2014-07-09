package com.gu.fronts.integration.test.pages.common

import org.openqa.selenium.WebDriver

import com.gu.automation.support.TestLogging
import com.gu.fronts.integration.test.PageHelper

/**
 * This is a parent class for all Page Objects and it defines two methods. isDisplayed is a method which needs to be implemented
 * which says if this page is properly displayed or not. url is an optional property which the page can define to say that this
 * is the url to be loaded before the Page Object is initialised
 */
abstract class FrontsParentPage(implicit driver: WebDriver) extends TestLogging with PageHelper {
  def isDisplayed()
  def url: String = null
}