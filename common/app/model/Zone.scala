package model

import common.Pagination
import play.api.libs.json.{JsString, JsValue}

case class Zone(
    path: String,
    override val webTitle: String,
    override val pagination: Option[Pagination]
) extends MetaData with AdSuffixHandlingForFronts with KeywordSponsorshipHandling {
  override def id: String = path

  override def section: String = path

  override val keywordIds: Seq[String] = frontKeywordIds(path)

  override lazy val isFront = true

  override lazy val url: String = s"/$path"

  override lazy val analyticsName = s"GFE:$section"

  override lazy val rssPath = Some(s"/$id/rss")

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ Map(
    "keywords" -> JsString(webTitle),
    "keywordIds" -> JsString(keywordIds.mkString(",")),
    "contentType" -> JsString("Section")
  )
}
