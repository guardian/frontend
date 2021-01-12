package model.dotcomrendering.pageElements

import com.gu.contentapi.client.model.v1.EmbedTracking
import com.gu.contentapi.client.model.v1.EmbedTracksType.{
  DoesNotTrack,
  EnumUnknownEmbedTracksType,
  Tracks,
  Unknown
}
import org.scalatest.{FlatSpec, Matchers}
import model.dotcomrendering.pageElements.PageElement.containsThirdPartyTracking

class PageElementTest extends FlatSpec with Matchers {
  "PageElement" should "classify capi tracking value correctly" in {
    containsThirdPartyTracking(None) should equal(false)
    containsThirdPartyTracking(Some(EmbedTracking(DoesNotTrack))) should equal(
      false)
    containsThirdPartyTracking(Some(EmbedTracking(Tracks))) should equal(true)
    containsThirdPartyTracking(Some(EmbedTracking(Unknown))) should equal(true)
    containsThirdPartyTracking(
      Some(EmbedTracking(EnumUnknownEmbedTracksType(99)))) should equal(true)
  }
}
