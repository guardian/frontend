package model

import com.gu.openplatform.contentapi.model.{ Section => ApiSection }
import common.Pagination
import dfp.DfpAgent

case class Section(private val delegate: ApiSection, override val pagination: Option[Pagination] = None) extends MetaData {

  lazy val section: String = id

  lazy val id: String = delegate.id
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle
  override lazy val description = Some(s"Latest news and comment on ${webTitle.toLowerCase()} from the Guardian")

  override lazy val url: String = SupportedUrl(delegate)

  override lazy val analyticsName = s"GFE:$section"

  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> webTitle,
    "content-type" -> "Section"
  )

  override def isSponsored = DfpAgent.isSponsored(this)
  override def isAdvertisementFeature = DfpAgent.isAdvertisementFeature(this)
}
