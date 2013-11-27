package model.commercial

import org.scalatest.{Matchers, FlatSpec}
import common.ExecutionContexts

class AdAgentTest extends FlatSpec with Matchers with ExecutionContexts {

  private val ad = new Ad {
    def isTargetedAt(segment: Segment) = segment.context.section.isEmpty
  }

  private val adAgent = new AdAgent[Ad] {}

  ignore should "not match any ads for a new visitor" in {
    val segment = Segment(Context(None, Nil), Seq("new"))

    val ads = adAgent.matchingAds(segment, Seq(ad))

    ads should be(empty)
  }

  "matchingAds" should "match ads for a repeat visitor" in {
    val segment = Segment(Context(None, Nil), Seq("repeat"))

    val ads = adAgent.matchingAds(segment, Seq(ad))

    ads should be(Seq(ad))
  }

}
