package model

import com.gu.openplatform.contentapi.model.{ Section => ApiSection }
import common.Pagination

case class Section(private val delegate: ApiSection, override val pagination: Option[Pagination] = None) extends MetaData {

  lazy val section: String = id

  lazy val id: String = delegate.id
  lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle
  override lazy val description = Some(s"Latest news and comment on ${webTitle.toLowerCase()} from the Guardian")

  override lazy val url: String = SupportedUrl(delegate)

  override lazy val analyticsName = s"GFE:$section"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> webTitle,
    "content-type" -> "Section"
  )
}
