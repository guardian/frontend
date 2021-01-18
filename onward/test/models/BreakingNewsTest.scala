package models

import java.net.URI
import java.util.UUID

import models.BreakingNewsFormats._
import org.joda.time.DateTime
import org.scalatest.{Matchers, WordSpec}
import play.api.libs.json.Json

class BreakingNewsTest extends WordSpec with Matchers {

  val randomUid = UUID.randomUUID()
  val id = "/category/2016/01/30/slug"
  val title = "This is a breaking news title"
  val message = "This is a breaking news message"
  val thumbnailUrl =
    "http://i.guimcode.co.uk/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg"
  val link = "http://www.theguardian.com/p/4fgcd"
  val publicationDate = DateTime.now
  val topics = Set(NewsAlertTypes.Uk, NewsAlertTypes.Sport)
  val n = NewsAlertNotification(
    randomUid,
    URI.create(id),
    title,
    message,
    Some(URI.create(thumbnailUrl)),
    URI.create(link),
    None,
    publicationDate,
    topics.map(_.toString),
  )
  val expectedBreakingNews = BreakingNews(Set(n))

  val json = Json.parse(s"""{
          |"collections": [
          |{
          |"displayName": "UK alerts",
          |"href": "uk",
          |"content": [
          |{
          |"uid": "$randomUid",
          |"title": "$title",
          |"headline": "$message",
          |"thumbnail": "$thumbnailUrl",
          |"shortUrl": "$link",
          |"id": "$id",
          |"frontPublicationDate": ${Json.toJson(publicationDate)}
          |}
          |]
          |},
          |{
          |"displayName": "US alerts",
          |"href": "us",
          |"content": []
          |},
          |{
          |"displayName": "AU alerts",
          |"href": "au",
          |"content": []
          |},
          |{
          |"displayName": "Sport alerts",
          |"href": "sport",
          |"content": [
          |{
          |"uid": "$randomUid",
          |"title": "$title",
          |"headline": "$message",
          |"thumbnail": "$thumbnailUrl",
          |"shortUrl": "$link",
          |"id": "$id",
          |"frontPublicationDate": ${Json.toJson(publicationDate)}
          |}
          |]
          |},
          |{
          |"displayName": "International alerts",
          |"href": "international",
          |"content": []
          |}
          |]
          |}
      """.stripMargin)

  "BreakingNews serialization" should {
    "produce expected json" in {
      val actualJson = Json.toJson(expectedBreakingNews)
      actualJson should equal(json)
    }
  }

  "BreakingNews deserialization" should {
    "produce expected object" in {
      val breakingNews = json.as[BreakingNews]
      breakingNews should equal(expectedBreakingNews)
    }
  }

  "Once created, Breaking news collections" should {
    val commonTopicShortString = "uk"
    val commonTopics = Set(NewsAlertType.fromShortString(commonTopicShortString).get.toString)
    val notifA = NewsAlertNotification(
      UUID.randomUUID(),
      URI.create(id),
      title,
      message,
      Some(URI.create(thumbnailUrl)),
      URI.create(link),
      None,
      DateTime.now,
      commonTopics ++ Set(NewsAlertTypes.Sport.toString),
    )
    val notifB = NewsAlertNotification(
      UUID.randomUUID(),
      URI.create(id),
      title,
      message,
      Some(URI.create(thumbnailUrl)),
      URI.create(link),
      None,
      notifA.publicationDate.plus(1),
      Set.empty[String] ++ commonTopics,
    )
    val breakingNews = BreakingNews(Set(notifA, notifB))
    "contain no more than one notifications" in {
      breakingNews.collections.foreach {
        _.content.size should be <= 1
      }
    }
    "contain the most recent notification" in {
      val mostRecent = if (notifA.publicationDate isAfter notifB.publicationDate) notifA else notifB
      val collection = breakingNews.collections.filter(_.href == commonTopicShortString).head
      collection.content should contain(mostRecent)
    }
  }

  "Passing non supported topic when creating Breaking News" should {
    val notif = NewsAlertNotification(
      UUID.randomUUID(),
      URI.create(id),
      title,
      message,
      Some(URI.create(thumbnailUrl)),
      URI.create(link),
      None,
      DateTime.now,
      Set("non breaking news topic", "doesn't exist"),
    )
    val breakingNews = BreakingNews(Set(notif))
    "result in empty collections" in {
      breakingNews.collections.foreach {
        _.content.size should equal(0)
      }
    }
  }
}
