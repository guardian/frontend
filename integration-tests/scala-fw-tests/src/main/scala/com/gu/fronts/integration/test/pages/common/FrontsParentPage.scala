package com.gu.fronts.integration.test.pages.common

import org.openqa.selenium.WebDriver

import com.gu.automation.support.TestLogging
import com.gu.fronts.integration.test.PageHelper

/**
 * This is a parent class for all Page Objects and it defines two methods. assertIsDisplayed is a method which needs to be
 * implemented which says if this page is properly displayed or not and if not should throw an exception with a proper error
 * message. There are methods in the PageHelper class, such as assertExistsAndDisplayed, which should be called with a variable
 * number of elements to be checked
 *
 * url is an optional property which the page can define to say that this
 * is the url to be loaded before the Page Object is initialised
 */
abstract class FrontsParentPage(implicit driver: WebDriver) extends TestLogging with PageHelper {
  def assertIsDisplayed()
  def url: String = null
}