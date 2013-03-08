package microapp

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{ GivenWhenThen, FeatureSpec }
import org.scalatest.matchers.ShouldMatchers
import controllers.microapp.LiveScoresComponentController
import feed.CompetitionSupport
import org.joda.time.{ DateTime, DateMidnight }
import play.api.mvc.RequestHeader
import play.api.libs.concurrent.Promise
import controllers.MatchNav
import model.{ Content, Competition }
import pa.{ MatchDayTeam, Result, FootballMatch }

class LiveScoresComponentFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Live Scores Component") {

    scenario("Call from a Match Report page") {

      val theMatch: FootballMatch = Result("1234", new DateTime(2013, 2, 25, 15, 0), None, "", false, None,
        MatchDayTeam("19", "West Ham", Some(2), None, None, Some("Andy Carroll(25 Pen),Joe Cole(58)")),
        MatchDayTeam("43", "Spurs", Some(3), None, None, Some("Gareth Bale(13),Gylfi Sigurdsson(76),Gareth Bale(90)")),
        None, None, None
      )

      val comp = Competition(
        id = "compId",
        url = "http://foo.com/comp",
        fullName = "The Competition",
        shortName = "compname",
        nation = "UK",
        matches = List(theMatch)
      )

      val comps = new CompetitionSupport {
        def competitions = List(comp)
      }

      val report = MockTrail("http://foo.com/report")
      val minByMin = MockTrail("http://foo.com/minByMin")
      val stats = MockTrail("http://foo.com/stats")
      val nav = MatchNav(theMatch, Some(report), Some(minByMin), stats, Some(report))

      given("A valid call from a match page on load")
      val url = "/football/microapp/scores?teams=43,19&currentPage=football/2013/feb/25/spurs-v-westham"
      val request = FakeRequest(GET, url)
      val controller = new LiveScoresForTest(comps, Some(nav))

      when("I call the controller")
      val result = controller.renderScores()(request)

      then("The response should have an OK status")
      status(result) should be(200)

      and("it should be HTML")
      contentType(result) should be(Some("text/html"))

      and("it should be UTF-8")
      charset(result) should be(Some("utf-8"))

      and("it should include the match report selected tab")
      contentAsString(result) should include("""<li><a class="active" href="#">Guardian report</a></li>""")

      and("it should include the minute by minute unselected tab")
      contentAsString(result) should include("""<li><a class="inactive" href="http://foo.com/minByMin">Min-by-min</a></li>""")

      and("it should include the match fats unselected tab")
      contentAsString(result) should include("""<li><a class="inactive" href="http://foo.com/stats">Match facts</a></li>""")

      and("it should include the competition name")
      contentAsString(result) should include("""<h2 data="compId">The Competition</h2>""")

      and("it should include the team scores")
      contentAsString(result) should include("""<th data="19">West Ham 2</th>""")
      contentAsString(result) should include("""<th data="43">Spurs 3</th>""")

      and("it should include the scorers")
      contentAsString(result) should include("""<li>Andy Carroll 25 Pen, </li>""")
      contentAsString(result) should include("""<li>Joe Cole 58</li>""")
      contentAsString(result) should include("""<li>Gareth Bale 13, </li>""")
      contentAsString(result) should include("""<li>Gylfi Sigurdsson 76, </li>""")
      contentAsString(result) should include("""<li>Gareth Bale 90</li>""")
    }

  }
}

case class MockTrail(val theUrl: String) extends Content(null) {
  override lazy val url = theUrl
}

class LiveScoresForTest(comps: CompetitionSupport, matchNav: Option[MatchNav]) extends LiveScoresComponentController {

  protected def teamExists(id: String): Boolean = true

  protected def competitions: CompetitionSupport = comps

  protected def promiseMatchNav(date: DateMidnight, team1: String, team2: String)(implicit request: RequestHeader): Promise[Option[MatchNav]] = Promise.pure(matchNav)

}