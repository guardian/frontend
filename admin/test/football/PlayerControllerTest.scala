import common.ExecutionContexts
import football.model.PA
import org.scalatest.{ShouldMatchers, FreeSpec}
import play.api.libs.json.{JsString, JsObject, JsArray}
import play.api.mvc.{AnyContentAsFormUrlEncoded, MultipartFormData}
import play.api.test._
import play.api.test.Helpers._
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import football.services.GetPaClient
import test.Fake
import xml.Utility.escape


class PlayerControllerTest extends FreeSpec with ShouldMatchers with GetPaClient with ExecutionContexts {

  "test redirects player card form submission to correct player page" in Fake {
    val Some(result) = route(FakeRequest(POST, "/admin/football/player/card", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("player" -> List("123456"), "team" -> List("1"), "competition" -> List("100"), "playerCardType" -> List("attack")))))
    status(result) should equal(SEE_OTHER)
    redirectLocation(result) should equal(Some("/admin/football/player/card/competition/attack/123456/1/100"))
  }

  "test player card renders correctly" in Fake {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player/card/competition/attack/237670/19/100"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
  }

  "test player card renders correctly for date instead of competition" in Fake {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player/card/date/attack/237670/19/20140101"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
  }

  "test can load autocomplete JSON for a team's squad" in Fake {
    val Some(result) = route(FakeRequest(GET, "/admin/football/api/squad/19"))
    status(result) should equal(OK)
    val content = contentAsJson(result)
    (content \ "players").as[List[JsObject]] should contain(JsObject(Seq("label" -> JsString("Heurelho Gomes"), "value" -> JsString("283600"))))
  }
}
