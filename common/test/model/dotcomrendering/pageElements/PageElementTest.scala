package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.EmbedTracking
import com.gu.contentapi.client.model.v1.EmbedTracksType.{DoesNotTrack, EnumUnknownEmbedTracksType, Tracks, Unknown}
import org.scalatest.matchers.should.Matchers
import model.dotcomrendering.pageElements.PageElement.containsThirdPartyTracking
import org.scalatest.flatspec.AnyFlatSpec

class PageElementTest extends AnyFlatSpec with Matchers {
  "PageElement" should "classify capi tracking value correctly" in {
    containsThirdPartyTracking(None, false) should equal(false)
    containsThirdPartyTracking(Some(EmbedTracking(DoesNotTrack)), false) should equal(false)
    containsThirdPartyTracking(Some(EmbedTracking(Tracks)), false) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(Unknown)), false) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(EnumUnknownEmbedTracksType(99))), false) should equal(true)

    containsThirdPartyTracking(None, true) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(DoesNotTrack)), true) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(Tracks)), true) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(Unknown)), true) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(EnumUnknownEmbedTracksType(99))), true) should equal(true)
  }
}
