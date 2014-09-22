package model.commercial

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import common.ExecutionContexts
import test.ConfiguredTestSuite

@DoNotDiscover class AdAgentTest extends FlatSpec with Matchers with ExecutionContexts with ConfiguredTestSuite {

  private val ad = new Ad {
    def isTargetedAt(segment: Segment) = segment.context.section.isEmpty
  }

  private val fallbackAds = Seq(
    new Ad {
      def isTargetedAt(segment: Segment) = true
    },
    new Ad {
      def isTargetedAt(segment: Segment) = true
    }
  )

  private val adAgent = new BaseAdAgent[Ad] {
    override def defaultAds = fallbackAds

    def currentAds = Seq(ad)

    protected def updateCurrentAds(ads: Seq[Ad]) = {}
  }

  "isTargetedAt" should "match ads for a repeat visitor" in {
    val segment = Segment(Context(None, Nil), Seq("repeat"))

    val ads = adAgent.adsTargetedAt(segment)

    ads should be(Seq(ad))
  }

  "isTargetedAt" should "fall back to a default seq if no there matching ads for a repeat visitor" in {
    val segment = Segment(Context(Some("section"), Nil), Seq("repeat"))

    val ads = adAgent.adsTargetedAt(segment)

    ads should be(fallbackAds)
  }
}
