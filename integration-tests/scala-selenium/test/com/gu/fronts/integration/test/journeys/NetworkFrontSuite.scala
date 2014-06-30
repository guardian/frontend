package com.gu.fronts.integration.test.journeys

import com.gu.fronts.integration.test.common.FrontsSeleniumTestSuite
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage

class NetworkFrontSuite extends FrontsSeleniumTestSuite {

  test("should click through the gallery overlay") {
    val nwFront = openNetworkFrontPage()
    nwFront.isDisplayed should be(true)
    
    val picContainer = nwFront.containers.containerWithId(NetworkFrontPage.IN_PICTURES_CONTAINER_ID)
    picContainer.isDisplayed should be(true)
    picContainer.galleryAt(0).isDisplayed should be(true)
  }
}