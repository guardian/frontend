package football

import common.ExecutionContexts
import controllers.admin.TablesController
import football.model.PA
import org.scalatest.{DoNotDiscover, ShouldMatchers, FreeSpec}
import play.api.mvc.AnyContentAsFormUrlEncoded
import play.api.test._
import play.api.test.Helpers._
import play.twirl.api.{HtmlFormat, Formats}
import test.ConfiguredTestSuite
import scala.annotation.tailrec
import football.services.GetPaClient
import scala.language.postfixOps

@DoNotDiscover class TablesControllerTest extends FreeSpec with GetPaClient with ExecutionContexts with ShouldMatchers with ConfiguredTestSuite {

  "test tables index page loads with leagues" in {
    val Some(result) = route(FakeRequest(GET, "/admin/football/tables"))
    status(result) should equal(OK)
    val content = contentAsString(result)
    PA.competitionNames
      .filter { case (seasonId, _) => PA.approvedCompetitions.contains(seasonId) }
      .values
      .foreach(seasonName => content should include(HtmlFormat.escape(seasonName).body))
  }

  "submitting a choice of league redirects to the correct table page" in {
    val Some(result) = route(FakeRequest(POST, "/admin/football/tables/league", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("competitionId" -> List("100"), "focus" -> List("none")))))
    status(result) should equal(SEE_OTHER)
    redirectLocation(result) should equal(Some("/admin/football/tables/league/100"))
  }

  "submitting league with 'focus' redirects to focus of selected league" in {
    val Some(resultTop) = route(FakeRequest(POST, "/admin/football/tables/league", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("competitionId" -> List("100"), "focus" -> List("top")))))
    status(resultTop) should equal(SEE_OTHER)
    redirectLocation(resultTop) should equal(Some("/admin/football/tables/league/100/top"))

    val Some(resultBottom) = route(FakeRequest(POST, "/admin/football/tables/league", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("competitionId" -> List("100"), "focus" -> List("bottom")))))
    status(resultBottom) should equal(SEE_OTHER)
    redirectLocation(resultBottom) should equal(Some("/admin/football/tables/league/100/bottom"))

    val Some(resultTeam) = route(FakeRequest(POST, "/admin/football/tables/league", FakeHeaders(), AnyContentAsFormUrlEncoded(Map("competitionId" -> List("100"), "focus" -> List("team"), ("teamId", List("19"))))))
    status(resultTeam) should equal(SEE_OTHER)
    redirectLocation(resultTeam) should equal(Some("/admin/football/tables/league/100/19"))

    val Some(resultTeams) = route(FakeRequest(POST, "/admin/football/tables/league", FakeHeaders(), AnyContentAsFormUrlEncoded(
      Map("competitionId" -> List("100"), "focus" -> List("team"), ("teamId", List("19")), ("team2Id", List("1006")))
    )))
    status(resultTeams) should equal(SEE_OTHER)
    redirectLocation(resultTeams) should equal(Some("/admin/football/tables/league/100/19/1006"))
  }

  "can show full table for selected league" in {
    val Some(result) = route(FakeRequest(GET, "/admin/football/tables/league/100"))
    status(result) should equal(OK)
    val content = contentAsString(result)
    content should include("Spurs")
    countSubstring(content, "<tr") should equal(21)
  }

  def countSubstring(str1:String, str2:String): Int = {
    @tailrec
    def count(pos:Int, c:Int): Int = {
      val idx=str1 indexOf(str2, pos)
      if(idx == -1) c else count(idx+str2.size, c+1)
    }
    count(0,0)
  }

  "the internal surroundingItems function should work OK" in {
    TablesController.surroundingItems[Int](1, List(1, 2, 3, 4, 5, 6), 4 ==) should equal(List(3, 4, 5))
    TablesController.surroundingItems[Int](2, List(1, 2, 3, 4, 5, 6), 4 ==) should equal(List(2, 3, 4, 5, 6))
    TablesController.surroundingItems[Int](3, List(1, 2, 3, 4, 5, 6), 4 ==) should equal(List(1, 2, 3, 4, 5, 6))
  }
}
