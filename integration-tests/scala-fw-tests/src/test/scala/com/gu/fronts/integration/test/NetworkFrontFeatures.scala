package com.gu.fronts.integration.test

import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage

class NetworkFrontFeatures extends FrontsSeleniumTestSuite {

  feature("My example feature") {
    scenarioWeb("My first test") {
      val nwFrontPage = goTo(new NetworkFrontPage)
    }
  }

}
