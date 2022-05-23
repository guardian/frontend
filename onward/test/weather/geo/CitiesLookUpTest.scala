package weather.geo

import akka.actor.ActorSystem
import org.mockito.Mockito._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsString, JsValue}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.language.postfixOps

class CitiesLookUpTest extends AnyFlatSpec with ScalaFutures with Matchers with MockitoSugar {
  val actorSystem = ActorSystem()

  "getLatitudeLongitude" should "return a valid LatitudeLongitude" in {
    val latLong = CitiesLookUp.getLatitudeLongitude(CityRef.makeFixedCase("Shanklin", "IOW", "GB"))
    val expected = Some(LatitudeLongitude(50.62613, -1.1785))
    latLong should equal(expected)

  }

}
