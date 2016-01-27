package models

import java.net.URI
import java.util.UUID

import models.BreakingNewsFormats._
import org.joda.time.DateTime
import org.scalatest.{Matchers, WordSpec}
import play.api.libs.json.Json

class BreakingNewsTest extends WordSpec with Matchers {

    val randomUuid = UUID.randomUUID()
    val title = "This is a breaking news title"
    val message = "This is a breaking news message"
    val thumbnailUrl = "http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg"
    val link = "http://gu.com/p/4fgcd"
    val publicationDate = DateTime.now
    val n = NewsAlertNotification(
      randomUuid,
      title,
      message,
      Some(URI.create(thumbnailUrl)),
      URI.create(link),
      None,
      publicationDate,
      Set(NewsAlertTypes.Uk, NewsAlertTypes.Sport))
    val expectedBreakingNews = BreakingNews(Set(n))

    val json = Json.parse(
      s"""{
          |"collections": [
          |{
          |"displayName": "UK alerts",
          |"href": "uk",
          |"content": [
          |{
          |"headline": "$title",
          |"message": "$message",
          |"thumbnail": "$thumbnailUrl",
          |"shortUrl": "$link",
          |"id": "$randomUuid",
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
          |"headline": "$title",
          |"message": "$message",
          |"thumbnail": "$thumbnailUrl",
          |"shortUrl": "$link",
          |"id": "$randomUuid",
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
    val commonTopics = Set(NewsAlertType.fromShortString(commonTopicShortString).get)
    val notifA = NewsAlertNotification(
      UUID.randomUUID(),
      title,
      message,
      Some(URI.create(thumbnailUrl)),
      URI.create(link),
      None,
      DateTime.now,
      commonTopics ++ Set(NewsAlertTypes.Sport))
    val notifB = NewsAlertNotification(
      UUID.randomUUID(),
      title,
      message,
      Some(URI.create(thumbnailUrl)),
      URI.create(link),
      None,
      notifA.publicationDate.plus(1),
      Set.empty[NewsAlertType] ++ commonTopics)
    val breakingNews = BreakingNews(Set(notifA, notifB))
    "contain no more than one notifications" in {
      breakingNews.collections.foreach {
        _.content.size should be <= 1
      }
    }
    "contain the most recent notification" in {
      val mostRecent = if(notifA.publicationDate isAfter notifB.publicationDate) notifA else notifB
      val collection = breakingNews.collections.filter(_.href == commonTopicShortString).head
      collection.content should contain(mostRecent)
    }
  }

}
