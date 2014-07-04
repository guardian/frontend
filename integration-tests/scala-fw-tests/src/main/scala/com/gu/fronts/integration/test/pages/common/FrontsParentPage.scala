package com.gu.fronts.integration.test.pages.common

import java.util.{ ArrayList, List }
import com.gu.automation.support.TestLogging
import org.apache.commons.collections.CollectionUtils
import org.apache.commons.lang3.StringUtils
import org.openqa.selenium.{ By, WebDriver, WebDriverException, WebElement }
import com.gu.fronts.integration.test.PageHelper
import com.gu.fronts.integration.test.PageHelper

abstract class FrontsParentPage(implicit driver: WebDriver) extends TestLogging with PageHelper {
  def isDisplayed()
  def url: String = null
}