package controllers

import model.{ Cached, Content }
import play.api.mvc.{ RequestHeader, Action, Controller }
import common.{ JsonComponent, Edition, Logging }
import org.joda.time.format.DateTimeFormat
import conf.{ Configuration, ContentApi }
import org.joda.time.DateMidnight
import play.api.libs.concurrent.Akka
import play.api.Play.current

object MoreOnMatchController extends Controller with Logging {

  val dateFormat = DateTimeFormat.forPattern("yyyyMMdd")

  def render(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = Action { implicit request =>

    val matchDate = dateFormat.parseDateTime(year + month + day).toDateMidnight
    val promiseOfRelated = Akka.future(loadRelated(request, matchDate, homeTeamId, awayTeamId))

    Async {
      promiseOfRelated.map {
        case Nil => NotFound
        case related => Cached(600)(JsonComponent(views.html.fragments.relatedTrails(related, "More on this match", 5)))
      }
    }
  }

  def loadRelated(request: RequestHeader, matchDate: DateMidnight, homeTeamId: String, awayTeamId: String): Seq[Content] = {
    ContentApi.search(Edition(request, Configuration))
      .section("football")
      .tag("tone/matchreports|football/series/squad-sheets|football/series/saturday-clockwatch")
      .fromDate(matchDate.minusDays(2))
      .toDate(matchDate.plusDays(2))
      .reference("pa-football-team/" + homeTeamId + ",pa-football-team/" + awayTeamId)
      .response.results.map {
        new Content(_)
      }
  }
}
