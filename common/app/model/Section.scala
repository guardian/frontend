package model

import com.gu.contentapi.client.model.{Section => ApiSection}
import common.Pagination
import play.api.libs.json.{JsString, JsValue}

case class Section(private val delegate: ApiSection, override val pagination: Option[Pagination] = None)
  extends MetaData with AdSuffixHandlingForFronts with KeywordSponsorshipHandling {

  def isEditionalised = delegate.editions.length > 1

  lazy val section: String = id

  lazy val id: String = delegate.id
  override lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle

  lazy val keywordIds: Seq[String] = frontKeywordIds(id)

  override lazy val isFront = true

  override lazy val url: String = SupportedUrl(delegate)

  override lazy val analyticsName = s"GFE:$section"

  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    "keywords" -> JsString(webTitle),
    "keywordIds" -> JsString(keywordIds.mkString(",")),
    "contentType" -> JsString("Section")
  )

  override def iosType: Option[String] = {
    val t = section match {
      case "crosswords" => None
      case _ => Some("front")
    }
    t
  }

}
