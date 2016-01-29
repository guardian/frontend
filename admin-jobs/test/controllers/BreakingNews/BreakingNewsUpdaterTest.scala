package controllers.BreakingNews

import java.net.URI
import java.util.UUID

import akka.pattern.ask
import akka.util.Timeout
import models.{NewsAlertNotification, NewsAlertTypes}
import org.joda.time.DateTime
import org.mockito.Matchers._
import org.mockito.Mockito._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.mock.MockitoSugar
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.{JsResultException, JsValue, Json}
import test.ConfiguredTestSuite

import scala.concurrent.duration._

@DoNotDiscover class BreakingNewsUpdaterTest extends WordSpec with Matchers with ConfiguredTestSuite with MockitoSugar {

  implicit val actorTimeout = Timeout(30.seconds)
  def newActorAndMockApi = {
    val mockBreakingNewsApi = mock[BreakingNewsApi]
    val actorRef = actorSystem.actorOf(BreakingNewsUpdater.props(mockBreakingNewsApi))
    (actorRef, mockBreakingNewsApi)
  }

  "Getting alerts" when {
    "no content is available" should {
      "have thrown an exception" in {

        val (actor, mockBreakingNewsApi) = newActorAndMockApi
        when(mockBreakingNewsApi.getBreakingNews) thenThrow new Exception()

        val f = actor ? GetAlertsRequest
        ScalaFutures.whenReady(f.failed) { e => e shouldBe an[Exception] }
      }
    }
    "content is available" should {
      "return json" in {

        val fakeContent = Json.parse("""{"field": "value"}""")
        val (actor, mockBreakingNewsApi) = newActorAndMockApi
        when(mockBreakingNewsApi.getBreakingNews) thenReturn Some(fakeContent)

        val f = (actor ? GetAlertsRequest).mapTo[Option[JsValue]]
        ScalaFutures.whenReady(f) {
          case Some(json) => json shouldBe a[JsValue]
          case _ => fail("It should be some JsValue instance")
        }
      }
    }
  }


  "Adding a new notification" when {
    val notification = NewsAlertNotification(
      UUID.randomUUID(),
      "Title",
      "message",
      Some(URI.create("http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg")),
      URI.create("http://gu.com/p/4fgcd"),
      None,
      DateTime.now(),
      Set(NewsAlertTypes.Uk, NewsAlertTypes.Sport))

    "fetching previous Breaking News fails" which {
      "fails" should {
        "throw an exception" in {
          val (actor, mockBreakingNewsApi) = newActorAndMockApi
          when(mockBreakingNewsApi.getBreakingNews) thenThrow (new Exception())
          val f = (actor ? NewNotificationRequest(notification)).mapTo[NewsAlertNotification]
          ScalaFutures.whenReady(f.failed) { e => e shouldBe an[Exception] }
        }
      }
      "succeeds " when {
        "parsing previous Breaking News" which {
          "fails" should {
            "throw an exception" in {
              val (actor, mockBreakingNewsApi) = newActorAndMockApi
              when(mockBreakingNewsApi.getBreakingNews) thenReturn Some(Json.parse( """{"valid": "json", "but": "not", "breaking": "news"}"""))

              val f = (actor ? NewNotificationRequest(notification)).mapTo[NewsAlertNotification]
              ScalaFutures.whenReady(f.failed) { e => e shouldBe an[JsResultException] }
            }
          }
          "succeeds" when {
            val emptyBreakingNewsJson = Json.parse(
              s"""{
                  |"collections": [
                  |{
                  |"displayName": "UK alerts",
                  |"href": "uk",
                  |"content": []
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
                  |"content": []
                  |},
                  |{
                  |"displayName": "International alerts",
                  |"href": "international",
                  |"content": []
                  |}
                  |]
                  |}""".stripMargin)
            "saving updated Breaking News" which {
              "fails" should {
                "throw an exception" in {
                  val (actor, mockBreakingNewsApi) = newActorAndMockApi
                  when(mockBreakingNewsApi.getBreakingNews) thenReturn Some(emptyBreakingNewsJson)
                  when(mockBreakingNewsApi.putBreakingNews(any[JsValue])) thenThrow  new Exception()

                  val f = (actor ? NewNotificationRequest(notification)).mapTo[NewsAlertNotification]
                  ScalaFutures.whenReady(f.failed) { e => e shouldBe an[Exception] }
                }
              }
              "succeeds" should {
                "return a notification" in {
                  val (actor, mockBreakingNewsApi) = newActorAndMockApi
                  when(mockBreakingNewsApi.getBreakingNews) thenReturn Some(emptyBreakingNewsJson)
                  when(mockBreakingNewsApi.putBreakingNews(any[JsValue])) thenReturn true

                  val f = (actor ? NewNotificationRequest(notification)).mapTo[NewsAlertNotification]
                  ScalaFutures.whenReady(f) { result =>
                    result shouldBe a [NewsAlertNotification]
                    result shouldBe notification
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
