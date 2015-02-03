package commercial

import driver.Driver
import org.scalatest.tags.Retryable
import org.scalatest.{FlatSpec, Matchers}


@Retryable class AdsTest extends FlatSpec with Matchers with Driver {

  "Ads" should "display on the network front" in {

    go to theguardianWithAds("/uk")

    withClue("Should display top banner ad") {
      $("#dfp-ad--top-above-nav > *").size should be > 0
    }

    withClue("Should display two MPUs") {
      $("#dfp-ad--inline1 > *").size should be > 0
      $("#dfp-ad--inline2 > *").size should be > 0
    }

  }
  
}
