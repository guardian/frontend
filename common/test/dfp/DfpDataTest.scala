package dfp

import org.scalatest.FlatSpec
import org.scalatest.Matchers

class DfpDataTest extends FlatSpec with Matchers {

  private val dfpData = {
    val adFeatureTargetSet = TargetSet("AND", Seq(
      Target("slot", "IS", Seq("adbadge")), Target("k", "IS", Seq("ad-feature"))))
    val sponsoredTargetSet = TargetSet("AND", Seq(
      Target("slot", "IS", Seq("spbadge")), Target("k", "IS", Seq("spon-page"))))
    val articleTargetSet = TargetSet("AND", Seq(
      Target("slot", "IS", Seq("inline1")), Target("k", "IS", Seq("article"))))
    DfpData(Seq(
      LineItem(0, Seq(adFeatureTargetSet)),
      LineItem(0, Seq(sponsoredTargetSet)),
      LineItem(1, Seq(articleTargetSet))
    ))
  }

  "isAdvertisementFeature" should "be true for an advertisement feature" in {
    dfpData.isAdvertisementFeature("ad-feature") should be(true)
  }

  it should "be false for a non advertisement feature" in {
    dfpData.isAdvertisementFeature("article") should be(false)
  }

  "isSponsored" should "be true for a sponsored article" in {
    dfpData.isSponsored("spon-page") should be(true)
  }

  it should "be false for an unsponsored article" in {
    dfpData.isSponsored("article") should be(false)
  }
}
