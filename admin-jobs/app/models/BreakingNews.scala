package models

import java.util.UUID
import play.api.libs.json._

case class BreakingNewsCollection(name: String, href: String, id: UUID, alerts: Set[NewsAlertNotification])

case class BreakingNews(alerts: Set[NewsAlertNotification]) {

  val collections = List(
    BreakingNewsCollection("UK alerts", "uk", UUID.fromString("5dff149e-3cc8-4b23-ba7d-c7596d8e39e5"), alerts.filter(_.isOfType(NewsAlertTypes.Uk))),
    BreakingNewsCollection("US alerts", "us", UUID.fromString("09b1cb74-9bba-4ed9-8430-dd45ca4e2c18"), alerts.filter(_.isOfType(NewsAlertTypes.Us))),
    BreakingNewsCollection("AU alerts", "au", UUID.fromString("4a7c44d3-146f-43c8-9b9b-d0e356aa50c7"), alerts.filter(_.isOfType(NewsAlertTypes.Au))),
    BreakingNewsCollection("Sport alerts", "sport", UUID.fromString("98f69f69-0e99-43ae-8c97-85e68be798a6"), alerts.filter(_.isOfType(NewsAlertTypes.Sport))),
    BreakingNewsCollection("International alerts", "international", UUID.fromString("a0fbc431-6de7-4fca-a4d6-4439bb71399e"), alerts.filter(_.isOfType(NewsAlertTypes.International)))
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
        "id" -> collection.id,
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

