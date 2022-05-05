package weather

import akka.actor.ActorSystem
import org.scalatest.concurrent.ScalaFutures
import play.api.libs.json.{JsString, JsValue}
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.Future
import scala.language.postfixOps

class WeatherApiTest extends AnyFlatSpec with ScalaFutures with Matchers with MockitoSugar {
  val actorSystem = ActorSystem()

  "retryWeatherRequest" should "return for a successful future" in {
    val jsValue = JsString("Test")

    val funMock = mock[() => Future[JsValue]]
    when(funMock.apply()) thenReturn Future.successful(jsValue)

    whenReady(WeatherApi.retryWeatherRequest(funMock, 100 milli, actorSystem.scheduler, 5))(_ shouldBe jsValue)
    verify(funMock).apply()
  }

}
