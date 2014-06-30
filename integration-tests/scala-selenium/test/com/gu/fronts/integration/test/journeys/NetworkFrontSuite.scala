package com.gu.fronts.integration.test.journeys

import com.gu.fronts.integration.test.common.FrontsSeleniumTestSuite

class NetworkFrontSuite extends FrontsSeleniumTestSuite {

  test("should load network front page") {
    val nwFront = openNetworkFrontPage()
    nwFront.isDisplayed should be(true)
  }
}