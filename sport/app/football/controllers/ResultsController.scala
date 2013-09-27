package controllers

import common._
import conf._
import feed.{ CompetitionSupport, Competitions }
import play.api.mvc.{ RequestHeader, Action, Controller }
import model._
import org.joda.time.DateMidnight
import org.joda.time.format.DateTimeFormat
import org.scala_tools.time.Imports._
import play.api.templates.Html


sealed trait ResultsRenderer extends Controller with Logging with CompetitionResultFilters with ExecutionContexts {

  val daysToDisplay = 3
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderResults(page: Page,
    competitions: CompetitionSupport,
    competitionName: Option[String],
    date: Option[DateMidnight],
    comp: Option[Competition])(implicit request: RequestHeader) = {
    val startDate = date.getOrElse(new DateMidnight)

    val resultsDays = competitions.previousMatchDates(startDate, daysToDisplay)

    val results = resultsDays.map { day => MatchesOnDate(day, competitions.withMatchesOn(day).competitions) }

    val nextPage = competitions.nextMatchDates(startDate.plusDays(1), daysToDisplay)
      .lastOption.map(toNextPreviousUrl(_, competitionName))

    val previousPage = resultsDays.lastOption.flatMap { date =>
      competitions.previousMatchDates(date.minusDays(1), daysToDisplay).headOption
    }.map(toNextPreviousUrl(_, competitionName))

    val resultsPage = MatchesPage(
      page = page,
      blog = None,
      days = results.filter(_.competitions.nonEmpty),
      nextPage = nextPage,
      previousPage = previousPage,
      pageType = "results",
      filters = filters,
      comp = comp
    )

    Cached(page) {
      if (request.isJson)
        JsonComponent(
          resultsPage.page, 
          Switches.all, 
          "html" -> football.views.html.fragments.matchesBody(resultsPage),
          "more" -> Html(previousPage.getOrElse(""))
        )
      else
        Ok(football.views.html.matches(resultsPage))
    }
  }

  def toNextPreviousUrl(date: DateMidnight, competition: Option[String]): String

}

object ResultsController extends ResultsRenderer with Logging {

  val page = new Page(
    "football/results",
    "football",
    "All results",
    "GFE:Football:automatic:results"
  )

  def renderForJson(year: String, month: String, day: String) = renderFor(year, month, day)
  def renderFor(year: String, month: String, day: String) = render(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def renderJson(date: Option[DateMidnight] = None) = render(date)
  def render(date: Option[DateMidnight] = None) = Action { implicit request =>
    renderResults(page, Competitions.withTodaysMatchesAndPastResults, None, date, None)
  }

  def routeCompetition(tag: String) = {
    Competitions.withTag(tag) map { CompetitionResultsController.render(tag, _) }
  }

  def routeTeam(tag: String) = {
    TeamMap.findTeamIdByUrlName(tag) map { teamId => TeamResultsController.render(tag, teamId) }
  }

  def renderTagJson(tag: String) = renderTag(tag)
  def renderTag(tag: String) = routeCompetition(tag) orElse routeTeam(tag) getOrElse Action(NotFound)

  override def toNextPreviousUrl(date: DateMidnight, competition: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/results"
    case other => "/football/results/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}

object CompetitionResultsController extends ResultsRenderer with Logging {

  override val daysToDisplay = 20

  def renderForJson(year: String, month: String, day: String, competitionName: String) = renderFor(year, month, day, competitionName)
  def renderFor(year: String, month: String, day: String, competitionName: String) = render(
    competitionName,
    Competitions.withTag(competitionName).get,
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(competitionName: String, competition: Competition, date: Option[DateMidnight] = None) = Action { implicit request =>

    val page = new Page(
      "football/results",
      "football",
      s"${competition.fullName} results",
      "GFE:Football:automatic:competition results"
    )
    renderResults(
      page,
      Competitions.withTodaysMatchesAndPastResults.withCompetitionFilter(competition.url),
      Some(competitionName),
      date,
      Some(competition)
    )
  }

  override def toNextPreviousUrl(date: DateMidnight, competition: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/%s/results" format (competition.get)
    case other => "/football/%s/results/%s" format (competition.get, other.toString("yyyy/MMM/dd").toLowerCase)
  }
}

object TeamResultsController extends Controller with Logging with CompetitionResultFilters {

  def render(teamName: String, teamId: String) = Action { implicit request =>

    Competitions.findTeam(teamId).map { team =>

      val fixtures = Competitions.withTeamMatches(team.id).sortBy(_.fixture.date.getMillis)
      val startDate = new DateMidnight
      val upcomingFixtures = fixtures.filter(_.fixture.date <= startDate).reverse

      val page = new Page(
        s"/football/$teamName/results",
        "football",
        s"${team.name} results",
        "GFE:Football:automatic:team results"
      )
      
      val htmlResponse = () => football.views.html.teamFixtures(page, filters, upcomingFixtures)
      val jsonResponse = () => football.views.html.fragments.teamFixturesBody(page, filters, upcomingFixtures)
      renderFormat(htmlResponse, jsonResponse, page, Switches.all)
    }.getOrElse(NotFound)
  }
}
