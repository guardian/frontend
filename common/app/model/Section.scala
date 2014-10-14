package model

import com.gu.openplatform.contentapi.model.{ Section => ApiSection }
import common.{Edition, Pagination}
import dfp.DfpAgent
import play.api.libs.json.{JsString, JsValue}

case class Section(private val delegate: ApiSection, override val pagination: Option[Pagination] = None)
  extends MetaData with AdSuffixHandlingForFronts {

  lazy val section: String = id

  lazy val id: String = delegate.id
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  override lazy val isFront = true

  override lazy val url: String = SupportedUrl(delegate)

  override lazy val analyticsName = s"GFE:$section"

  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    "keywords" -> JsString(webTitle),
    "content-type" -> JsString("Section")
  )

  override lazy val isSponsored: Boolean = DfpAgent.isSponsored(id, Some(id))
  override lazy val hasMultipleSponsors: Boolean = DfpAgent.hasMultipleSponsors(id)
  override lazy val isAdvertisementFeature: Boolean = DfpAgent.isAdvertisementFeature(id, Some(id))
  override lazy val hasMultipleFeatureAdvertisers: Boolean = DfpAgent.hasMultipleFeatureAdvertisers(id)
  override lazy val isFoundationSupported: Boolean = DfpAgent.isFoundationSupported(id, Some(id))
  override lazy val sponsor: Option[String] = DfpAgent.getSponsor(id)
  override def hasPageSkin(edition: Edition): Boolean = DfpAgent.isPageSkinned(adUnitSuffix, edition)
}
