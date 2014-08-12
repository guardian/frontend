package com.gu.integration.test.pages.common

import com.gu.automation.support.TestLogging
import com.gu.integration.test.util.ElementLoader._
import org.openqa.selenium.{WebElement, WebDriver}

/**
 * This is a parent class for all Page Objects and does both pull in some traits, most importantly the PageHelper, so that
 * not all concrete page objects need to do it explicitly. And also contains elements present on all pages.
 */
class ParentPage(implicit driver: WebDriver) extends TestLogging {
}