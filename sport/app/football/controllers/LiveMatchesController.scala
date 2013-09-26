package controllers

import common._
import conf._
import feed.{ CompetitionSupport, Competitions }
import play.api.mvc.{ RequestHeader, Action, Controller }
import model._
import org.joda.time.DateMidnight
import model.Page
import conf.Configuration


object LiveMatchesController extends Controller with CompetitionLiveFilters with Logging with ExecutionContexts {

  val page = new Page("football/live", "football", "Today's matches", "GFE:Football:automatic:live matches") {
    override val cacheSeconds = 10
  }

  def renderFor(competitionName: String) = Action { implicit request =>
    Competitions.competitions.find(_.url.endsWith(competitionName)).map { competition =>
      renderLive(Competitions.withCompetitionFilter(s"/football/$competitionName"), Some(competition))
    }.getOrElse(NotFound)
  }

  def renderLive(competitions: CompetitionSupport, competition: Option[Competition])(implicit request: RequestHeader) = {

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

  def renderJson() = render()
  def render() = Action { implicit request =>
    renderLive(Competitions, None)
  }
}
