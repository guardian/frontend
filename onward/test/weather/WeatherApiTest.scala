package weather

import akka.actor.ActorSystem
import org.scalatest.{FlatSpec, Matchers}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.mockito.MockitoSugar
import play.api.libs.json.{JsString, JsValue}
import org.mockito.Mockito._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.Future
import scala.language.postfixOps

class WeatherApiTest extends FlatSpec with ScalaFutures with Matchers with MockitoSugar {
  val actorSystem = ActorSystem()

  "retryWeatherRequest" should "return for a successful future" in {
    val jsValue = JsString("Test")

    val funMock = mock[() => Future[JsValue]]
    when(funMock.apply()) thenReturn Future.successful(jsValue)

    whenReady(WeatherApi.retryWeatherRequest(funMock, 100 milli, actorSystem.scheduler, 5))(_ shouldBe jsValue)
    verify(funMock, times(1)).apply()
  }

  "retryWeatherRequest" should "fail after 5 exceptions" in {
    val funMock = mock[() => Future[JsValue]]
    when(funMock.apply()) thenReturn Future.failed(new RuntimeException("failure"))

    WeatherApi.retryWeatherRequest(funMock, 1 milli, actorSystem.scheduler, 5).failed.futureValue shouldBe a [RuntimeException]
    verify(funMock, times(5)).apply()
  }
}
