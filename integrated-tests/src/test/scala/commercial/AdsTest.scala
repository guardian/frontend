package integration

import Config.baseUrl
import org.scalatest.tags.Retryable
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover @Retryable class AdsTest extends FlatSpec with Matchers with SharedWebDriver {

  "Ads" should "display on the network front" in {

    webDriver.get(theguardianWithAds("/uk"))
    webDriver.navigate().refresh()

    // This is an essential sleep, because the implicitlyWait isn't sufficient to ensure that
    // the js application has completed, since the dfp-ad classes exist on page load.
    Thread.sleep(10000)
    implicitlyWait(10)

    withClue("Should display top banner ad") {
      $("#dfp-ad--top-above-nav > *").size should be > 0
    }

    withClue("Should display two MPUs") {
      $("#dfp-ad--inline1 > *").size should be > 0
      $("#dfp-ad--inline2 > *").size should be > 0
    }

  }

  protected def theguardianWithAds(path: String) = s"$baseUrl$path?test=test#gu.prefs.switchOn=adverts"
}
