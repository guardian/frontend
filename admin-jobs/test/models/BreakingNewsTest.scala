package models

import java.net.URI
import java.util.UUID

import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class BreakingNewsTest extends FlatSpec with Matchers {

  "BreakingNews" should "transform into a correct json representation" in {
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

    val expectedJson = Json.parse(
      s"""{
          |"WebTitle": "BreakingNews",
          |"refreshStatus": true,
          |"collections": [
          |{
          |"displayName": "UK alerts",
          |"href": "uk",
          |"id": "5dff149e-3cc8-4b23-ba7d-c7596d8e39e5",
          |"content": [
          |{
          |"headline": "$title",
          |"trailText": "",
          |"thumbnail": "$thumbnailUrl",
          |"shortUrl": "$link",
          |"id": "$randomUuid",
          |"group": "1",
          |"frontPublicationDate": ${publicationDate.getMillis}
          |}
          |]
          |},
          |{
          |"displayName": "US alerts",
          |"href": "us",
          |"id": "09b1cb74-9bba-4ed9-8430-dd45ca4e2c18",
          |"content": []
          |},
          |{
          |"displayName": "AU alerts",
          |"href": "au",
          |"id": "4a7c44d3-146f-43c8-9b9b-d0e356aa50c7",
          |"content": []
          |},
          |{
          |"displayName": "Sport alerts",
          |"href": "sport",
          |"id": "98f69f69-0e99-43ae-8c97-85e68be798a6",
          |"content": [
          |{
          |"headline": "$title",
          |"trailText": "",
          |"thumbnail": "$thumbnailUrl",
          |"shortUrl": "$link",
          |"id": "$randomUuid",
          |"group": "1",
          |"frontPublicationDate": ${publicationDate.getMillis}
          |}
          |]
          |},
          |{
          |"displayName": "International alerts",
          |"href": "international",
          |"id": "a0fbc431-6de7-4fca-a4d6-4439bb71399e",
          |"content": []
          |}
          |]
          |}
      """.stripMargin)
    val actualJson = Json.toJson(BreakingNews(Set(n)))
    actualJson should equal(expectedJson)
  }

}
