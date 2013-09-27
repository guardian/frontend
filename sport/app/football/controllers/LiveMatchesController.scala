package controllers

import common._
import conf._
import feed.{ CompetitionSupport, Competitions }
import play.api.mvc.{ RequestHeader, Action, Controller }
import model._
import org.joda.time.DateMidnight
import model.Page


object LiveMatchesController extends Controller with CompetitionLiveFilters with Logging with ExecutionContexts {

  val page = new Page("football/live", "football", "Today's matches", "GFE:Football:automatic:live matches") {
    override val cacheSeconds = 10
  }

  def renderLiveMatchesJson() = renderLiveMatches()
  def renderLiveMatches() = Action { implicit request =>
    renderLive(Competitions, None)
  }

  def renderLiveMatchesJsonFor(competitionName: String) = renderLiveMatchesFor(competitionName)
  def renderLiveMatchesFor(competitionName: String) = Action { implicit request =>
    Competitions.competitions.find(_.url.endsWith(competitionName)).map { competition =>
      renderLive(Competitions.withCompetitionFilter(s"/football/$competitionName"), Some(competition))
    }.getOrElse(NotFound)
  }


  private def renderLive(competitions: CompetitionSupport, competition: Option[Competition])(implicit request: RequestHeader) = {
    val today = new DateMidnight()

    val blog: Option[Trail] = LiveBlogAgent(Edition(request))

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

    val htmlResponse = () => football.views.html.matches(livePage)
    val jsonResponse = () => football.views.html.fragments.matchesBody(livePage)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)
  }
}
