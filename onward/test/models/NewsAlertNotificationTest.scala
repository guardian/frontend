package models

import java.net.URI
import java.util.UUID

import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class NewsAlertNotificationTest extends FlatSpec with Matchers {

  private val uid = UUID.randomUUID()
  private val title = "This is a breaking news title"
  private val message = "This is a breaking news message"
  private val thumbnailUrl =
    "http://i.guimcode.co.uk/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg"
  private val link = "http://theguardian.com/p/4fgcd"
  private val imageUrl =
    "http://i.guimcode.co.uk/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg"
  private val publicationDate = "2016-01-18T12:21:01.000Z"
  private val urlId = "/category/2016/01/30/slug"
  private val topics = Set("breaking/sport", "breaking/uk")
  private val topicsString = Json.toJson(topics).toString()

  "Creating NewsAlertNotification" should "succeed when json contains all fields" in {
    val json = Json.parse(s"""{"uid":"$uid",
          |"title":"$title",
          |"message":"$message",
          |"thumbnailUrl":"$thumbnailUrl",
          |"link":"$link",
          |"imageUrl":"$imageUrl",
          |"publicationDate":"$publicationDate",
          |"urlId":"$urlId",
          |"topics":$topicsString}""".stripMargin)
    json.validate[NewsAlertNotification].asOpt shouldBe Some(
      NewsAlertNotification(
        uid,
        URI.create(urlId),
        title,
        message,
        Some(URI.create(thumbnailUrl)),
        URI.create(link),
        Some(URI.create(imageUrl)),
        DateTime.parse(publicationDate),
        topics,
      ),
    )
  }

  it should "succeed when json contains no optional field" in {
    val jsonWithoutOptionalFields = Json.parse(s"""{"uid":"$uid",
           |"title":"$title",
           |"message":"$message",
           |"link":"$link",
           |"publicationDate":"$publicationDate",
           |"urlId":"$urlId",
           |"topics":$topicsString}""".stripMargin)
    jsonWithoutOptionalFields.validate[NewsAlertNotification].asOpt shouldBe Some(
      NewsAlertNotification(
        uid,
        URI.create(urlId),
        title,
        message,
        None,
        URI.create(link),
        None,
        DateTime.parse(publicationDate),
        topics,
      ),
    )
  }

  it should "fail when json contains invalid url" in {
    val jsonWithInvalidUrl = Json.parse(s"""{"uid":"$uid",
          |"title":"$title",
          |"message":"$message",
          |"link":"this is not a valid link",
          |"publicationDate":"$publicationDate",
          |"urlId":"$urlId",
          |"topics":$topicsString}""".stripMargin)
    jsonWithInvalidUrl.validate[NewsAlertNotification].asOpt shouldBe None
  }

  it should "fail when json contains invalid publication date" in {
    val jsonWithInvalidDate = Json.parse(s"""{"uid":"$uid",
          |"title":"$title",
          |"message":"$message",
          |"link":"$link",
          |"publicationDate":"11-22-3333",
          |"urlId":"$urlId",
          |"topics":$topicsString}""".stripMargin)
    jsonWithInvalidDate.validate[NewsAlertNotification].asOpt shouldBe None
  }

  "Notification with UK and Sport topics" should "be both of type UK and Sport" in {
    val n = NewsAlertNotification(
      uid,
      URI.create(urlId),
      title,
      message,
      None,
      URI.create(link),
      None,
      DateTime.now,
      Set(NewsAlertTypes.Uk, NewsAlertTypes.Sport).map(_.toString),
    )
    n.isOfType(NewsAlertTypes.Uk) shouldBe true
    n.isOfType(NewsAlertTypes.Sport) shouldBe true
  }

}
