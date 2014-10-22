package model

import com.gu.contentapi.client.model.{ Section => ApiSection }
import common.{Edition, Pagination}
import dfp.DfpAgent
import play.api.libs.json.{JsString, JsValue}

case class Section(private val delegate: ApiSection, override val pagination: Option[Pagination] = None)
  extends MetaData with AdSuffixHandlingForFronts {

  lazy val section: String = id

  lazy val id: String = delegate.id
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  lazy val keywordIds: Seq[String] = frontKeywordIds(id)

  override lazy val isFront = true

  override lazy val url: String = SupportedUrl(delegate)

  override lazy val analyticsName = s"GFE:$section"

  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    "keywords" -> JsString(webTitle),
    "keywordIds" -> JsString(keywordIds.mkString(",")),
    "content-type" -> JsString("Section")
  )

  override lazy val isSponsored: Boolean = keywordIds exists (DfpAgent.isSponsored(_, Some(id)))

  override lazy val hasMultipleSponsors: Boolean = keywordIds exists {
    DfpAgent.hasMultipleSponsors
  }

  override lazy val isAdvertisementFeature: Boolean = keywordIds exists {
    DfpAgent.isAdvertisementFeature(_, Some(id))
  }

  override lazy val hasMultipleFeatureAdvertisers: Boolean = keywordIds exists {
    DfpAgent.hasMultipleFeatureAdvertisers
  }

  override lazy val isFoundationSupported: Boolean = keywordIds exists {
    DfpAgent.isFoundationSupported(_, Some(id))
  }

  override lazy val sponsor: Option[String] = keywordIds.flatMap(DfpAgent.getSponsor(_)).headOption

  override def hasPageSkin(edition: Edition): Boolean = DfpAgent.isPageSkinned(adUnitSuffix, edition)
}
