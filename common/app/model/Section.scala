package model

import com.gu.openplatform.contentapi.model.{ Section => ApiSection }
import common.{Edition, Pagination}
import dfp.DfpAgent

case class Section(private val delegate: ApiSection, override val pagination: Option[Pagination] = None)
  extends MetaData with AdSuffixHandlingForFronts {

  lazy val section: String = id

  lazy val id: String = delegate.id
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  override lazy val isFront = true

  override lazy val description = Some(s"Latest news and comment on ${webTitle.toLowerCase} from the Guardian")

  override lazy val url: String = SupportedUrl(delegate)

  override lazy val analyticsName = s"GFE:$section"

  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> webTitle,
    "content-type" -> "Section"
  )

  override lazy val isSponsored = DfpAgent.isSponsored(id)
  override lazy val isAdvertisementFeature = DfpAgent.isAdvertisementFeature(id)
  override lazy val isFoundationSupported = DfpAgent.isFoundationSupported(id)
  override lazy val sponsor = DfpAgent.getSponsor(id)
  override def hasPageSkin(edition: Edition) = DfpAgent.isPageSkinned(adUnitSuffix, edition)
}
