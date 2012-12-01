package controllers

import common._
import feed.{ CompetitionSupport, Competitions }
import play.api.mvc.{ RequestHeader, Action, Controller }
import model._
import org.joda.time.DateMidnight
import model.Page
import conf.Configuration

object LiveMatchesController extends Controller with CompetitionLiveFilters with Logging {

  val page = new Page(Some("http://www.guardian.co.uk/football/matches"), "football/live", "football",
    "Today's matches", "GFE:Football:automatic:live matches") {
    override val cacheSeconds = 10
  }

  def renderFor(competitionName: String) = Action { implicit request =>
    Competitions.competitions.find(_.url.endsWith(competitionName)).map { competition =>
      renderLive(Competitions.withCompetitionFilter(competitionName), Some(competition))
    }.getOrElse(NotFound)
  }

  def renderLive(competitions: CompetitionSupport, competition: Option[Competition])(implicit request: RequestHeader) = {

    val today = new DateMidnight()

    val blog = LiveBlog(Edition(request, Configuration))

    val matches = Seq(MatchesOnDate(today, competitions.withMatchesOn(today).competitions))

    val livePage = MatchesPage(
      page = page,
      blog = blog,
      days = matches.filter(_.competitions.nonEmpty),
      nextPage = None,
      previousPage = None,
      pageType = "live",
      filters = filters,
      comp = competition
    )

    Cached(page) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(views.html.fragments.matchesList(livePage, livePage.pageType))
      }.getOrElse(Ok(Compressed(views.html.matches(livePage))))
    }
  }

  def render() = Action { implicit request =>
    renderLive(Competitions, None)
  }
}
