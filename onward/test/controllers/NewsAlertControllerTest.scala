package controllers

import java.net.URI
import java.util.UUID

import akka.actor.Status.{Failure => ActorFailure}
import akka.actor.{Actor, ActorSystem, Props}
import akka.stream.Materializer
import models.{NewsAlertNotification, NewsAlertTypes}
import org.joda.time.DateTime
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.Json
import play.api.mvc.ControllerComponents
import play.api.test.FakeRequest
import play.api.test.Helpers._
import services.breakingnews.{BreakingNewsApi, S3BreakingNews}
import test.{ConfiguredTestSuite, WithTestApplicationContext}

@DoNotDiscover class NewsAlertControllerTest
    extends WordSpec
    with Matchers
    with ConfiguredTestSuite
    with WithTestApplicationContext {

  implicit lazy val materializer: Materializer = app.materializer
  lazy val controllerComponents: ControllerComponents =
    play.api.test.Helpers.stubControllerComponents(playBodyParsers = stubPlayBodyParsers(materializer))

  val testApiKey = "test-api-key"

  lazy val actorSystem: ActorSystem = app.actorSystem

  class MockUpdaterActor(mockResponse: Any) extends Actor {
    override def receive: PartialFunction[Any, Unit] = { case _ => sender ! mockResponse }
  }
  object MockUpdaterActor {
    def props(mockResponse: Any): Props = Props(new MockUpdaterActor(mockResponse))
  }

  def controllerWithActorReponse(mockResponse: Any): NewsAlertController = {
    val updaterActor = actorSystem.actorOf(MockUpdaterActor.props(mockResponse))
    val fakeApi =
      new BreakingNewsApi(
        new S3BreakingNews(testApplicationContext.environment),
      ) // Doesn't matter, it is not used just passed to the NewsAlertController constructor
    new NewsAlertController(fakeApi)(actorSystem, controllerComponents) {
      override lazy val breakingNewsUpdater = updaterActor
      override lazy val apiKey = testApiKey
    }
  }

  "GET /news-alert/alerts" when {
    val getAlertsRequest = FakeRequest(method = "GET", path = "/news-alert/alerts")
    "no content is available" should {
      "204" in {
        val controller = controllerWithActorReponse(None)
        val response = call(controller.alerts, getAlertsRequest)
        status(response) should be(NO_CONTENT)
      }
    }
    "an error happened while accessing content" should {
      "500" in {
        val controller = controllerWithActorReponse(ActorFailure(new Exception()))
        val response = call(controller.alerts, getAlertsRequest)
        status(response) should be(INTERNAL_SERVER_ERROR)
      }
    }
    "json content is available" should {
      val validJson = Json.parse("""{"field": "value"}""")
      "200 with json content" in {
        val controller = controllerWithActorReponse(Some(validJson))
        val response = call(controller.alerts, getAlertsRequest)

        status(response) should be(OK)
        contentType(response) shouldBe Some("application/json")
        contentAsJson(response) should equal(validJson)
      }
    }
  }

  "POST /news-alert/alert" when {
    val postAlertRequest = FakeRequest(method = "POST", path = "/news-alert/alert")
      .withHeaders(
        ("Content-Type", "application/json"),
        ("X-Gu-Api-Key", testApiKey),
      )
    "request body is empty" should {
      "400" in {
        val controller = controllerWithActorReponse("Doesn't matter")
        val response = call(controller.create, postAlertRequest)
        status(response) should be(BAD_REQUEST)
      }
    }

    "mandatory fields in request body are empty" should {
      val jsonBody = Json.parse("""{"uid":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
          |"urlId":"category/2016/feb/01/slug",
          |"title":"This is a breaking news title",
          |"publicationDate":"2016-01-18T12:21:01.000Z"}""".stripMargin)
      val request = postAlertRequest.withJsonBody(jsonBody)
      "400" in {
        val controller = controllerWithActorReponse("Doesn't matter")
        val response = call(controller.create, request)
        status(response) should be(BAD_REQUEST)
      }
    }

    "request body is valid" when {
      val jsonBody = Json.parse(
        """{"uid":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
          |"urlId":"category/2016/feb/01/slug",
          |"title":"This is a breaking news title",
          |"message":"This is a breaking news message",
          |"thumbnailUrl":"http://i.guimcode.co.uk/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
          |"link":"http://gu.com/p/4fgcd",
          |"imageUrl":"http://i.guimcode.co.uk/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
          |"publicationDate":"2016-01-18T12:21:01.000Z",
          |"topics":["breaking/us"]}""".stripMargin,
      )
      val request = postAlertRequest.withJsonBody(jsonBody)
      "Breaking News update fails" should {
        "500" in {
          val controller = controllerWithActorReponse(ActorFailure(new Exception))
          val response = call(controller.create, request)
          status(response) should be(INTERNAL_SERVER_ERROR)
        }
      }
      "Breaking News update succeeds" should {
        "204" in {
          val notification = NewsAlertNotification(
            UUID.randomUUID(),
            URI.create("category/2016/feb/01/slug"),
            "Title",
            "message",
            Some(
              URI.create(
                "http://i.guimcode.co.uk/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
              ),
            ),
            URI.create("http://gu.com/p/4fgcd"),
            None,
            DateTime.now(),
            Set(NewsAlertTypes.Uk, NewsAlertTypes.Sport).map(_.toString),
          )
          val controller = controllerWithActorReponse(notification)
          val response = call(controller.create, request)
          status(response) should be(CREATED)
        }

      }
    }
  }
}
