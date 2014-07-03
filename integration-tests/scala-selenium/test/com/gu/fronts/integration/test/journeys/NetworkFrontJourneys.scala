package com.gu.fronts.integration.test.journeys

import com.gu.fronts.integration.test.common.FrontsSeleniumTestSuite
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage.IN_PICTURES_CONTAINER_ID
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.common.FaciaContainer
import com.gu.fronts.integration.test.page.common.GalleryOverlay

class NetworkFrontJourneys extends FrontsSeleniumTestSuite {

  test("click through the picture gallery overlay journey") {
    val nwFront = goToNWFrontPage
    val picContainer = nwFront.containers.containerWithId(IN_PICTURES_CONTAINER_ID)
    picContainer.isDisplayed should be(true)

    val picOverlay = clickFirstValidPictureOn(picContainer)

    //check that nw front is still in the background
    nwFront.isDisplayed should be(true)

    picOverlay.clickGalleryGridMode
    picOverlay.clickGalleryFullMode

    val networkFrontPageAfterClose = picOverlay.close();
    networkFrontPageAfterClose.isDisplayed should be(true)
  }

  private def goToNWFrontPage: NetworkFrontPage = {
    val nwFront = openNetworkFrontPage()
    nwFront.isDisplayed should be(true)
    nwFront
  }

  private def clickFirstValidPictureOn(picContainer: FaciaContainer) = {
    val firstGallery = picContainer.firstGalleryItem
    firstGallery.isDisplayed should be(true)
    val picOverlay = firstGallery.clickPicture
    picOverlay.isDisplayed should be(true)
    picOverlay
  }

  private def clickFirstValidPictureOn(picOverlay: GalleryOverlay) = {
    val displayedImageBefore = picOverlay.getDisplayedImage();
    picOverlay.clickNextGallery();
    // give some time for next image to become active
    Thread.sleep(200);
    val displayedImageAfter = picOverlay.getDisplayedImage();
    displayedImageBefore should not be (displayedImageAfter)
  }
}