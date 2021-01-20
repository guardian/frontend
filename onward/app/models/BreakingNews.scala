package models

import java.net.URI
import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json._

object BreakingNewsFormats {

  import URIFormats._

  // publicationDate (timestamp)
  implicit val tf = new Format[DateTime] {
    override def writes(dt: DateTime): JsValue = Json.toJson(dt.getMillis)
    override def reads(json: JsValue): JsResult[DateTime] = Json.fromJson[Long](json).map(new DateTime(_))
  }

  implicit val breakingNewsEntryReads: Reads[NewsAlertNotification] = (
    (__ \ "uid").read[UUID] and
      (__ \ "id").read[URI] and
      (__ \ "title").read[String] and
      (__ \ "headline").read[String] and
      (__ \ "thumbnail").readNullable[URI] and
      (__ \ "shortUrl").read[URI] and
      Reads.pure(None) and //imageUrl
      (__ \ "frontPublicationDate").read[DateTime] and
      Reads.pure(Set.empty[String]) //topics
  )(NewsAlertNotification.apply _)
  implicit val breakingNewsEntryWrites = new Writes[NewsAlertNotification] {
    def writes(notification: NewsAlertNotification): JsValue = {
      Json.obj(
        "uid" -> notification.uid,
        "title" -> notification.title,
        "headline" -> notification.message,
        "thumbnail" -> notification.thumbnailUrl,
        "shortUrl" -> notification.link,
        "id" -> notification.urlId,
        "frontPublicationDate" -> notification.publicationDate,
      )
    }
  }

  implicit val breakingNewsCollectionFormat = Json.format[BreakingNewsCollection]

  implicit val breakingNewsReads: Reads[BreakingNews] =
    (__ \ "collections").read[Set[BreakingNewsCollection]].map(collections => BreakingNews.apply(collections))
  implicit val breakingNewsWrites = new Writes[BreakingNews] {
    def writes(b: BreakingNews): JsValue = Json.obj("collections" -> b.collections)
  }

}

case class BreakingNewsCollection(displayName: String, href: String, content: Set[NewsAlertNotification])

case class BreakingNews(alerts: Set[NewsAlertNotification]) {

  val collections = List(
    BreakingNewsCollection("UK alerts", "uk", alertsOfType(NewsAlertTypes.Uk)),
    BreakingNewsCollection("US alerts", "us", alertsOfType(NewsAlertTypes.Us)),
    BreakingNewsCollection("AU alerts", "au", alertsOfType(NewsAlertTypes.Au)),
    BreakingNewsCollection("Sport alerts", "sport", alertsOfType(NewsAlertTypes.Sport)),
    BreakingNewsCollection("International alerts", "international", alertsOfType(NewsAlertTypes.International)),
  )

  private def alertsOfType(newsAlertType: NewsAlertType): Set[NewsAlertNotification] =
    alerts
      .filter(_.isOfType(newsAlertType))
      .toList
      .sortWith(_.publicationDate isAfter _.publicationDate)
      .take(1)
      .toSet //We are only interested by the most recent alert
}

object BreakingNews {

  def apply(collections: Set[BreakingNewsCollection])(implicit d: DummyImplicit): BreakingNews = {

    val notifications = collections
      .flatMap { collection =>
        // Create copy of notifications with topic based on the collection they belonged to
        collection.content.map { n =>
          NewsAlertNotification(
            n.uid,
            n.urlId,
            n.title,
            n.message,
            n.thumbnailUrl,
            n.link,
            n.imageUrl,
            n.publicationDate,
            Set(NewsAlertType.fromShortString(collection.href).get.toString),
          )
        }
      }
      .toList
      .sortBy(_.uid) // sort by id so notifications with same uid are next to each other
      .foldLeft(Set.empty[NewsAlertNotification]) {
        (notifications: Set[NewsAlertNotification], notifB: NewsAlertNotification) =>
          // Merge together notifications which have the same uid but have different topics (concatenating their topics)
          if (notifications.isEmpty) {
            Set(notifB)
          } else {
            val notifA = notifications.head
            if (notifA.uid == notifB.uid) {
              Set(
                NewsAlertNotification(
                  notifB.uid,
                  notifB.urlId,
                  notifB.title,
                  notifB.message,
                  notifB.thumbnailUrl,
                  notifB.link,
                  notifB.imageUrl,
                  notifB.publicationDate,
                  notifA.topics ++ notifB.topics,
                ),
              )
            } else {
              Set(notifA, notifB)
            }
          }
      }

    new BreakingNews(notifications)
  }
}
