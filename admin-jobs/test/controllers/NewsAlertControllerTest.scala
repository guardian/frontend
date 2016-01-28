package controllers

import java.net.URI
import java.util.UUID

import akka.actor.Status.{Failure => ActorFailure}
import akka.actor.{Actor, Props}
import common.ExecutionContexts
import models.{NewsAlertTypes, NewsAlertNotification}
import org.joda.time.DateTime
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.Json
import play.api.test.FakeRequest
import play.api.test.Helpers._
import test.ConfiguredTestSuite

@DoNotDiscover class NewsAlertControllerTest extends WordSpec with Matchers with ConfiguredTestSuite with ExecutionContexts{

  class MockUpdaterActor(mockResponse: Any) extends Actor {
    override def receive = { case _ => sender ! mockResponse }
  }
  object MockUpdaterActor {
    def props(mockResponse: Any): Props = Props(new MockUpdaterActor(mockResponse))
  }

  def controllerWithActorReponse(mockResponse: Any) = {
    val updaterActor = actorSystem.actorOf(MockUpdaterActor.props(mockResponse))
    new NewsAlertController { override val breakingNewsUpdater = updaterActor }
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
      val validJson = Json.parse( """{"field": "value"}""")
      "200 with json content" in {
        val controller = controllerWithActorReponse(Some(validJson))
        val response = call(controller.alerts, getAlertsRequest)

        status(response) should be(OK)
        header("Content-Type", response) match {
          case Some(h) => h should startWith("application/json")
          case _ => assert(false)
        }
        contentAsJson(response) should equal(validJson)
      }
    }
  }

  "POST /news-alert/alert" when {
    val postAlertRequest = FakeRequest(method = "POST", path = "/news-alert/alert").withHeaders(("Content-Type", "application/json"))
    "request body is empty" should {
      "400" in {
        val controller = controllerWithActorReponse("Doesn't matter")
        val response = call(controller.create, postAlertRequest)
        status(response) should be(BAD_REQUEST)
      }
    }

    "mandatory fields in request body are empty" should {
      val jsonBody = Json.parse(
        """{"id":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
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
        """{"id":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
          |"title":"This is a breaking news title",
          |"message":"This is a breaking news message",
          |"thumbnailUrl":"http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
          |"link":"http://gu.com/p/4fgcd",
          |"imageUrl":"http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
          |"publicationDate":"2016-01-18T12:21:01.000Z",
          |"topics":["breaking/us"]}""".stripMargin)
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
            "Title",
            "message",
            Some(URI.create("http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg")),
            URI.create("http://gu.com/p/4fgcd"),
            None,
            DateTime.now(),
            Set(NewsAlertTypes.Uk, NewsAlertTypes.Sport))
          val controller = controllerWithActorReponse(notification)
          val response = call(controller.create, request)
          status(response) should be(CREATED)
        }

      }
    }
  }
}
