package com.gu.fronts.integration.test

import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage._

class NetworkFrontFeatures extends FrontsSeleniumTestSuite {

  feature("Network Front") {
    scenarioWeb("click through the picture gallery overlay") {
      val nwFront = goTo(new NetworkFrontPage)
      val picContainer = nwFront.faciaContainerWithId(InPicturesContainerId)

      val pictureOverlay = picContainer.firstPictureItem.clickPicture

      pictureOverlay.clickGalleryGridMode
      pictureOverlay.clickGalleryFullMode

      val displayedImgBefore = pictureOverlay.getDisplayedImage
      pictureOverlay.clickNextPicture
      // give some time for next image to become active
      Thread.sleep(500);
      val displayedImgAfter = pictureOverlay.getDisplayedImage;
      displayedImgBefore should not be (displayedImgAfter)
    }
  }
}
