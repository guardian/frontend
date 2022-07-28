package football

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.libs.json.{JsObject, JsString}
import play.api.mvc.AnyContentAsFormUrlEncoded
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers
import test.{ConfiguredTestSuite, WithMaterializer, WithTestWsClient}

@DoNotDiscover class PlayerControllerTest
    extends AnyFreeSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient {

  "test redirects player card form submission to correct player page" in {
    val Some(result) = route(
      app,
      FakeRequest(
        POST,
        "/admin/football/player/card",
        FakeHeaders(),
        AnyContentAsFormUrlEncoded(
          Map(
            "player" -> List("123456"),
            "team" -> List("1"),
            "competition" -> List("100"),
            "playerCardType" -> List("attack"),
          ),
        ),
      ),
    )
    status(result) should equal(SEE_OTHER)
    redirectLocation(result) should equal(Some("/admin/football/player/card/competition/attack/123456/1/100"))
  }

  "test player card renders correctly" in {
    val Some(result) = route(app, FakeRequest(GET, "/admin/football/player/card/competition/attack/237670/19/100"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
  }

  "test player card renders correctly for date instead of competition" in {
    val Some(result) = route(app, FakeRequest(GET, "/admin/football/player/card/date/attack/237670/19/20140101"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
  }

  "test can load autocomplete JSON for a team's squad" in {
    val Some(result) = route(app, FakeRequest(GET, "/admin/football/api/squad/19"))
    status(result) should equal(OK)
    val content = contentAsJson(result)
    (content \ "players").as[List[JsObject]] should contain(
      JsObject(Seq("label" -> JsString("Hugo Lloris"), "value" -> JsString("299285"))),
    )
  }

  "test can return json when json format supplied" in {
    val Some(result) = route(app, FakeRequest(GET, "/admin/football/player/card/date/attack/237670/19/20140101.json"))
    status(result) should equal(OK)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }
}
