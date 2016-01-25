package models

import java.util.UUID
import play.api.libs.json._

case class BreakingNewsCollection(name: String, href: String, alerts: Set[NewsAlertNotification])

case class BreakingNews(alerts: Set[NewsAlertNotification]) {

  val collections = List(
    BreakingNewsCollection("UK alerts", "uk", alerts.filter(_.isOfType(NewsAlertTypes.Uk))),
    BreakingNewsCollection("US alerts", "us", alerts.filter(_.isOfType(NewsAlertTypes.Us))),
    BreakingNewsCollection("AU alerts", "au", alerts.filter(_.isOfType(NewsAlertTypes.Au))),
    BreakingNewsCollection("Sport alerts", "sport", alerts.filter(_.isOfType(NewsAlertTypes.Sport))),
    BreakingNewsCollection("International alerts", "international", alerts.filter(_.isOfType(NewsAlertTypes.International)))
  )
}

object BreakingNews {

  implicit val breakingNewsEntryWrites = new Writes[NewsAlertNotification] {
    def writes(notification: NewsAlertNotification): JsValue = {
      val thumbnailUrlString = notification.thumbnailUrl match {
          case Some(u) => u.toString
          case None => ""
        }
      Json.obj(
        "headline" -> notification.title,
        "trailText" -> "",
        "thumbnail" -> JsString(thumbnailUrlString),
        "shortUrl" -> notification.link.toString,
        "id" -> notification.id,
        "group" -> "1",
        "frontPublicationDate" -> notification.publicationDate.getMillis()
      )
    }
  }

  implicit val breakingNewsCollectionWrites = new Writes[BreakingNewsCollection] {
    def writes(collection: BreakingNewsCollection): JsValue = {
      Json.obj(
        "displayName" -> collection.name,
        "href" -> collection.href,
        "content" -> collection.alerts
      )
    }
  }
  implicit val breakingNewsWrites = new Writes[BreakingNews] {
    def writes(b: BreakingNews): JsValue = {
      Json.obj(
        "WebTitle" -> "BreakingNews",
        "refreshStatus" -> true,
        "collections" -> b.collections
      )
    }
  }

}

