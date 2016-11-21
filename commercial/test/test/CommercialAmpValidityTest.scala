package test

import org.scalatest.DoNotDiscover


@DoNotDiscover class CommercialAmpValidityTest extends AmpValidityTest {

  Seq(
    "/advertiser-content/audi-history-of-audi/audi-and-innovation" // Hosted article page
  ).foreach(testAmpPageValidity)
}
