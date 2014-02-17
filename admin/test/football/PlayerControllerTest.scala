import common.ExecutionContexts
import football.model.PA
import org.scalatest.{ShouldMatchers, FreeSpec}
import play.api.mvc.{AnyContentAsFormUrlEncoded, MultipartFormData}
import play.api.test._
import play.api.test.Helpers._
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import football.services.GetPaClient
import test.Fake
import xml.Utility.escape


class PlayerControllerTest extends FreeSpec with ShouldMatchers with GetPaClient with ExecutionContexts {

  "test player index loads with players as choices" in Fake {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    val expectedPlayers = Await.result (
      Future.sequence(PA.teams.prem.map { case (teamId, name) =>
        client.squad(teamId)
      }),
      1.seconds
    ).flatten
    expectedPlayers.foreach { player =>
      val name = escape(player.name).replace("'", "&#x27;")
      content should include(name)
    }
  }

  "test redirects player head2head form submission to correct player page" in Fake {
    val Some(result) = route(FakeRequest(POST, "/admin/football/player/head2head", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("player1" -> List("123456"), "player2" -> List("654321")))))
    status(result) should equal(SEE_OTHER)
    redirectLocation(result) should equal(Some("/admin/football/player/head2head/123456/654321"))
  }

  "test player head to head renders correctly" in Fake {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player/head2head/237670/193388"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
    content should include("Jermain Defoe")
  }

  "test redirects player card form submission to correct player page" in Fake {
    val Some(result) = route(FakeRequest(POST, "/admin/football/player/card", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("player" -> List("123456")))))
    status(result) should equal(SEE_OTHER)
    redirectLocation(result) should equal(Some("/admin/football/player/card/123456"))
  }

  "test player card renders correctly" in Fake {
    val Some(result) = route(FakeRequest(GET, "/admin/football/player/card/237670"))
    status(result) should equal(OK)
    val content = contentAsString(result)

    content should include("Emmanuel Adebayor")
  }
}
