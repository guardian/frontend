package com.gu.fronts.integration.test.journeys

import com.gu.fronts.integration.test.common.FrontsSeleniumTestSuite
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage

class NetworkFrontSuite extends FrontsSeleniumTestSuite {

  test("should click through the gallery overlay") {
    val nwFront = openNetworkFrontPage()
    nwFront.isDisplayed should be(true)
    
    val picContainer = nwFront.containers.containerWithId(NetworkFrontPage.IN_PICTURES_CONTAINER_ID)
    picContainer.isDisplayed should be(true)
    
    //select the first valid picture gallery item
    val firstGallery = picContainer.firstGalleryItem
    firstGallery.isDisplayed should be(true)
    val picOverlay = firstGallery.clickPicture
    picOverlay.isDisplayed should be(true)
    
    //check that nw front is still in the background
    nwFront.isDisplayed should be(true)
  }
}