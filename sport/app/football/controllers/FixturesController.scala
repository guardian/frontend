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


trait FixtureRenderer extends Controller with CompetitionFixtureFilters {

  val daysToDisplay = 3
  val datePattern = DateTimeFormat.forPattern("yyyyMMMdd")

  def renderFixtures(page: Page,
    competitions: CompetitionSupport,
    date: Option[DateMidnight] = None,
    competitionFilter: Option[String],
    comp: Option[Competition])(implicit request: RequestHeader) = {
    val startDate = date.getOrElse(new DateMidnight)

    val dates = competitions.nextMatchDates(startDate, daysToDisplay)

    val fixtures = dates.map { day => MatchesOnDate(day, competitions.withMatchesOn(day).competitions) }

    val nextPage = dates.lastOption.flatMap { date =>
      competitions.nextMatchDates(date.plusDays(1), daysToDisplay).headOption
    }.map(date => toNextPreviousUrl(date, competitionFilter))

    val previousPage = competitions.previousMatchDates(startDate.minusDays(1), daysToDisplay)
      .lastOption.map(date => toNextPreviousUrl(date, competitionFilter))

    val fixturesPage = MatchesPage(
      page = page,
      blog = None,
      days = fixtures.filter(_.competitions.nonEmpty),
      nextPage = nextPage,
      previousPage = previousPage,
      pageType = "fixtures",
      filters = filters,
      comp = comp
    )
    
    Cached(page) {
      if (request.isJson)
        JsonComponent(
          fixturesPage.page, 
          Switches.all, 
          "html" -> football.views.html.fragments.matchesBody(fixturesPage),
          "more" -> Html(nextPage.getOrElse(""))
        )
      else
        Ok(football.views.html.matches(fixturesPage))
    }
  }

  def toNextPreviousUrl(date: DateMidnight, competitionFilter: Option[String]): String
}

object FixturesController extends FixtureRenderer with Logging with ExecutionContexts {

  val page = new Page(
    "football/fixtures",
    "football",
    "All fixtures",
    "GFE:Football:automatic:fixtures"
  )

  def renderForJson(year: String, month: String, day: String) = renderFor(year, month, day)
  def renderFor(year: String, month: String, day: String) = render(
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def renderJson(date: Option[DateMidnight] = None) = render(date)
  def render(date: Option[DateMidnight] = None) = Action { implicit request =>
    renderFixtures(page, Competitions.withTodaysMatchesAndFutureFixtures, date, None, None)
  }

  def routeCompetition(tag: String) = {
    Competitions.withTag(tag) map { CompetitionFixturesController.render(tag, _) }
  }

  def routeTeam(tag: String) = {
    TeamMap.findTeamIdByUrlName(tag) map { teamId => TeamFixturesController.render(tag, teamId) }
  }

  def renderTag(tag: String) = routeCompetition(tag) orElse routeTeam(tag) getOrElse Action(NotFound)

  override def toNextPreviousUrl(date: DateMidnight, competitionFilter: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/fixtures"
    case other => "/football/fixtures/%s" format (other.toString("yyyy/MMM/dd").toLowerCase)
  }
}

object CompetitionFixturesController extends FixtureRenderer with Logging {

  override val daysToDisplay = 20

  def renderForJson(year: String, month: String, day: String, competitionName: String) = renderFor(year, month, day, competitionName)
  def renderFor(year: String, month: String, day: String, competitionName: String) = render(
    competitionName,
    Competitions.withTag(competitionName).map { comp => comp }.get,
    Some(datePattern.parseDateTime(year + month + day).toDateMidnight)
  )

  def render(competitionName: String, competition: Competition, date: Option[DateMidnight] = None) = Action { implicit request =>

    val page = new Page(
      "football/fixtures",
      "football",
      s"${competition.fullName} fixtures",
      "GFE:Football:automatic:competition fixtures"
    )

    renderFixtures(
      page,
      Competitions.withTodaysMatchesAndFutureFixtures.withCompetitionFilter(competition.url),
      date,
      Some(competitionName),
      Some(competition)
    )
  }

  override def toNextPreviousUrl(date: DateMidnight, competition: Option[String]) = date match {
    case today if today == DateMidnight.now => "/football/%s/fixtures" format (competition.getOrElse(""))
    case other => "/football/%s/fixtures/%s" format (competition.getOrElse(""), other.toString("yyyy/MMM/dd").toLowerCase)
  }
}

object TeamFixturesController extends Controller with Logging with CompetitionFixtureFilters {

  def render(teamName: String, teamId: String) = Action { implicit request =>

    Competitions.findTeam(teamId).map { team =>

      val fixtures = Competitions.withTeamMatches(team.id).sortBy(_.fixture.date.getMillis)
      val startDate = new DateMidnight
      val upcomingFixtures = fixtures.filter(_.fixture.date >= startDate)

      val page = new Page(
        s"football/$teamName/fixtures",
        "football",
        s"${team.name} fixtures",
        "GFE:Football:automatic:team fixtures"
      )

      Cached(60) {
        val html = football.views.html.teamFixtures(page, filters, upcomingFixtures)
        Ok(html)
      }
    }.getOrElse(NotFound)
  }

  def renderComponent(teamId: String) = Action { implicit request =>
    Competitions.findTeam(teamId).map { team =>
      val fixtures = Competitions.withTeamMatches(teamId).sortBy(_.fixture.date.getMillis)

      val startDate = new DateMidnight

      val previousResult = fixtures.filter(_.fixture.date <= startDate).takeRight(1)
      val upcomingFixtures = fixtures.filter(_.fixture.date >= startDate).take(2)
      
    
      val html = () => football.views.html.fragments.teamFixtures(team, previousResult, upcomingFixtures)
      renderFormat(html, html, 60)
    }.getOrElse(NotFound)
  }
}
