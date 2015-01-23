package football

import common.ExecutionContexts
import org.scalatest.{DoNotDiscover, ShouldMatchers, FreeSpec}
import play.api.libs.json.{JsString, JsObject}
import play.api.mvc.{AnyContentAsFormUrlEncoded}
import play.api.test._
import play.api.test.Helpers._
import football.services.GetPaClient
import test.ConfiguredTestSuite

@DoNotDiscover class PlayerControllerTest extends FreeSpec with ShouldMatchers with GetPaClient with ExecutionContexts with ConfiguredTestSuite {

  "test redirects player card form submission to correct player page" in {
    val Some(result) = route(FakeRequest(POST, "/admin/football/player/card", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("player" -> List("123456"), "team" -> List("1"), "competition" -> List("100"), "playerCardType" -> List("attack")))))
    status(result) should equal(SEE_OTHER)
    redirectLocation(result) should equal(Some("/admin/football/player/card/competition/attack/123456/1/100"))
  }

  "test player card renders correctly" in {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player/card/competition/attack/237670/19/100"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
  }

  "test player card renders correctly for date instead of competition" in {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player/card/date/attack/237670/19/20140101"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
  }

  "test can load autocomplete JSON for a team's squad" in {
    val Some(result) = route(FakeRequest(GET, "/admin/football/api/squad/19"))
    status(result) should equal(OK)
    val content = contentAsJson(result)
    (content \ "players").as[List[JsObject]] should contain(JsObject(Seq("label" -> JsString("Heurelho Gomes"), "value" -> JsString("283600"))))
  }

  "test can return json when json format supplied" in {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player/card/date/attack/237670/19/20140101.json"))
    status(result) should equal(OK)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }
}
