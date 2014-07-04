package com.gu.fronts.integration.test

import org.scalatest.FeatureSpec
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage


class HelloWorldTest extends FrontsSeleniumTestSuite {

  feature("My example feature") {
    scenarioWeb("My first test") {
      
      val nwFrontPage = goTo("http://www.theguardian.com", classOf[NetworkFrontPage])
      nwFrontPage.isDisplayed should be (false)
    }
  }

}
