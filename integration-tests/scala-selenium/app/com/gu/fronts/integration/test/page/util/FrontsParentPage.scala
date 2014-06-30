package com.gu.fronts.integration.test.page.util

import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.openqa.selenium.WebDriver

import com.gu.fronts.integration.test.page.common.FooterPage
import com.gu.fronts.integration.test.page.common.HeaderPage

object FrontsParentPage {

  private var LOG: Log = LogFactory.getLog(classOf[FrontsParentPage])
}

abstract class FrontsParentPage(webDriver: WebDriver) extends AbstractParentPage(webDriver) {

  def header(): HeaderPage = {
    if (this.isInstanceOf[HeaderPage]) {
      throw new RuntimeException("Cannot get header from HeaderPage as it is the header")
    }
    pageFactory.initPage(webDriver, classOf[HeaderPage])
  }

  def footer(): FooterPage = {
    if (this.isInstanceOf[FooterPage]) {
      throw new RuntimeException("Cannot get footer from FooterPage as it is the footer")
    }
    pageFactory.initPage(webDriver, classOf[FooterPage])
  }
}