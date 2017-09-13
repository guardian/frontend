package rendering.core

import akka.actor.{ActorSystem, Props}
import akka.pattern.ask
import akka.util.Timeout
import helpers.ExceptionMatcher
import model.ApplicationContext
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.json.{JsValue, Json}
import test.{ConfiguredTestSuite, WithTestApplicationContext}
import rendering.Renderable

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

@DoNotDiscover class RenderingActorTest
  extends FlatSpec
  with ConfiguredTestSuite
  with WithTestApplicationContext
  with Matchers
  with ExceptionMatcher {

  lazy val actorSystem: ActorSystem = app.actorSystem
  implicit lazy val timeout = new Timeout(10.seconds)

  class TestRenderingActor extends RenderingActor(testApplicationContext) {
    override def javascriptFile: String = "common/test/resources/components/TestButtonComponent.js"
  }

  lazy val actor = actorSystem.actorOf(Props(new TestRenderingActor))

  "Sending rendering message" should "return a string" in {
    val component = new Renderable {
      override def props: Option[JsValue] = Some(Json.obj("title" -> "my title"))
    }
    val f = (actor ? Rendering(component)).mapTo[Try[String]]
    Await.result(f, timeout.duration) match {
      case Success(s) => s should not be(empty)
      case Failure(e) => fail(s"A string should have been returned. Error: $e")
    }
  }

  "Sending unknown message" should "return a rendering exception" in {
    val f = (actor ? "unknown message").mapTo[Try[String]]
    Await.result(f, timeout.duration) should failAs(classOf[RenderingException])
  }

}
