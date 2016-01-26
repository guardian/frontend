package models

import models.BreakingNewsFormats._

import java.net.URI
import java.util.UUID

import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class BreakingNewsTest extends FlatSpec with Matchers {

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

  "BreakingNews serialization" should "produce expected json" in {
    val actualJson = Json.toJson(expectedBreakingNews)
    actualJson should equal(json)
  }

  "BreakingNews deserialization" should "produce expected object" in {
    val breakingNews = json.as[BreakingNews]
    breakingNews should equal(expectedBreakingNews)
  }

}
