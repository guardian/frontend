package models
import java.net.URI
import java.util.UUID
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class NewsAlertNotificationTest extends FlatSpec with Matchers {

  private val randomUuid = UUID.randomUUID()
  private val title = "This is a breaking news title"
  private val message = "This is a breaking news message"
  private val thumbnailUrl = "http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg"
  private val link = "http://gu.com/p/4fgcd"
  private val imageUrl = "http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg"
  private val publicationDate = "2016-01-18T12:21:01.000Z"
  private val topics = Set("breaking/sport", "breaking/uk")
  private val topicsString = Json.toJson(topics).toString()
  private val topicsSet: Set[NewsAlertType] = topics.map(NewsAlertType.fromString(_)).flatten

  "Creating NewsAlertNotification" should "succeed when json contains all fields" in {
    val json = Json.parse(
      s"""{"id":"$randomUuid",
          |"title":"$title",
          |"message":"$message",
          |"thumbnailUrl":"$thumbnailUrl",
          |"link":"$link",
          |"imageUrl":"$imageUrl",
          |"publicationDate":"$publicationDate",
          |"topics":$topicsString}""".stripMargin)
    json.validate[NewsAlertNotification].asOpt shouldBe Some(NewsAlertNotification(
      id = randomUuid,
      title = title,
      message = message,
      thumbnailUrl = Some(URI.create(thumbnailUrl)),
      link = URI.create(link),
      imageUrl = Some(URI.create(imageUrl)),
      publicationDate = DateTime.parse(publicationDate),
      topics = topicsSet
    ))
  }


   it should "succeed when json contains no optional field" in {
     val jsonWithoutOptionalFields = Json.parse(
       s"""{"id":"$randomUuid",
           |"title":"$title",
           |"message":"$message",
           |"link":"$link",
           |"publicationDate":"$publicationDate",
           |"topics":$topicsString}""".stripMargin)
    jsonWithoutOptionalFields.validate[NewsAlertNotification].asOpt shouldBe Some(NewsAlertNotification(
      id = randomUuid,
      title = title,
      message = message,
      thumbnailUrl = None,
      link = URI.create(link),
      imageUrl = None,
      publicationDate = DateTime.parse(publicationDate),
      topics = topicsSet
    ))
  }


  it should "fail when json contains invalid url" in {
    val jsonWithInvalidUrl = Json.parse(
      s"""{"id":"$randomUuid",
          |"title":"$title",
          |"message":"$message",
          |"link":"this is not a valid link",
          |"publicationDate":"$publicationDate",
          |"topics":$topicsString}""".stripMargin)
    jsonWithInvalidUrl.validate[NewsAlertNotification].asOpt shouldBe None
  }


  it should "fail when json contains invalid publication date" in {
    val jsonWithInvalidDate = Json.parse(
      s"""{"id":"$randomUuid",
          |"title":"$title",
          |"message":"$message",
          |"link":"$link",
          |"publicationDate":"11-22-3333",
          |"topics":$topicsString}""".stripMargin)
    jsonWithInvalidDate.validate[NewsAlertNotification].asOpt shouldBe None
  }


  it should "fail when json contains no topic" in {
    val jsonWithNoTopic = Json.parse(
      s"""{"id":"$randomUuid",
          |"title":"$title",
          |"message":"$message",
          |"link":"$link",
          |"publicationDate":"$publicationDate",
          |"topics":[]}""".stripMargin)
    jsonWithNoTopic.validate[NewsAlertNotification].asOpt shouldBe None
  }


  it should "fail when json contains invalid topic" in {
      val jsonWithInvalidTopics = Json.parse(
      s"""{"id":"$randomUuid",
          |"title":"$title",
          |"message":"$message",
          |"link":"$link",
          |"publicationDate":"$publicationDate",
          |"topics":["breaking/uk", "this topic doesn't exist"]}""".stripMargin)
    jsonWithInvalidTopics.validate[NewsAlertNotification].asOpt shouldBe None
  }

  "Notification with UK and Sport topics" should "be both of type UK and Sport" in {
    val n = NewsAlertNotification(
      randomUuid,
      title,
      message,
      None,
      URI.create(link),
      None,
      DateTime.now,
      Set(NewsAlertTypes.Uk, NewsAlertTypes.Sport))
    n.isOfType(NewsAlertTypes.Uk) shouldBe true
    n.isOfType(NewsAlertTypes.Sport) shouldBe true
  }

}
