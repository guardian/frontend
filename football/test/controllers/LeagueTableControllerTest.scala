package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class LeagueTableControllerTest extends FlatSpec with ShouldMatchers {
  
  "League Table Controller" should "200 when content type is table" in Fake {
    val result = controllers.LeagueTableController.render()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to table" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/tables?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.LeagueTableController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
  it should "200 when content type is teams" in Fake {
    val result = controllers.LeagueTableController.renderTeamlist()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to teams" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/teams?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.LeagueTableController.renderTeamlist()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
  val competitionId = "premierleague"
  
  it should "200 when content type is competition table" in Fake {
    val result = controllers.LeagueTableController.renderCompetition(competitionId)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to competition table" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/" + competitionId + "/table?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.LeagueTableController.renderCompetition(competitionId)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
}