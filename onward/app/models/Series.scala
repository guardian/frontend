package models

import play.api.mvc.RequestHeader
import play.api.libs.json._
import model.{RelatedContent, Tag}

case class Series(id: String, tag: Tag, trails: RelatedContent) {
  lazy val displayName = tag.id match {
    case "commentisfree/commentisfree" => "opinion"
    case _ => tag.metadata.webTitle
 }
}

case class SeriesStoriesDCR(id: String, displayname: String, tag: Tag, trails: Seq[OnwardItem])

object SeriesStoriesDCR {
  implicit val onwardItemWrites = Json.writes[OnwardItem]
  implicit val seriesStoriesDCRWrites = Json.writes[SeriesStoriesDCR]
  def fromSeries(series: Series)(implicit request: RequestHeader): SeriesStoriesDCR = {
    val trails = OnwardCollection.trailsToItems(series.trails.faciaItems)
    SeriesStoriesDCR(series.id, series.displayName, series.tag, trails)
  }
}
