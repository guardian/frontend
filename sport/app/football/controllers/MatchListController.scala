package football.controllers

import common.{Edition, JsonComponent}
import feed.Competitions
import football.model.MatchesList
import implicits.Requests
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, Competition, TeamMap}
import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat
import pa.FootballTeam
import play.api.mvc.{BaseController, RequestHeader}
import play.twirl.api.Html

trait MatchListController extends BaseController with Requests {
  def competitionsService: Competitions
  protected val datePattern = DateTimeFormat.forPattern("yyyyMMMdd").withZone(Edition.defaultEdition.timezone)
  protected def createDate(year: String, month: String, day: String): LocalDate =
    datePattern.parseDateTime(s"$year$month$day").toLocalDate

  protected def renderMatchList(
      page: FootballPage,
      matchesList: MatchesList,
      filters: Map[String, Seq[CompetitionFilter]],
  )(implicit request: RequestHeader, context: ApplicationContext) = {
    Cached(10) {
      if (request.isJson)
        JsonComponent(
          "html" -> football.views.html.matchList.matchesComponent(matchesList),
          "next" -> Html(matchesList.nextPage.getOrElse("")),
          "previous" -> Html(matchesList.previousPage.getOrElse("")),
        )
      else
        RevalidatableResult.Ok(football.views.html.matchList.matchesPage(page, matchesList, filters))
    }
  }

  protected def renderMoreMatches(
      page: FootballPage,
      matchesList: MatchesList,
      filters: Map[String, Seq[CompetitionFilter]],
  )(implicit request: RequestHeader, context: ApplicationContext) = {
    Cached(10) {
      if (request.isJson)
        JsonComponent(
          "html" -> football.views.html.matchList.moreMatchesComponent(matchesList),
          "next" -> Html(matchesList.nextPage.getOrElse("")),
          "previous" -> Html(matchesList.previousPage.getOrElse("")),
        )
      else
        RevalidatableResult.Ok(football.views.html.matchList.matchesPage(page, matchesList, filters))
    }
  }

  protected def lookupCompetition(tag: String): Option[Competition] = {
    competitionsService.competitionsWithTag(tag).orElse(competitionsService.competitionsWithId(tag))
  }
  protected def lookupTeam(tag: String): Option[FootballTeam] = {
    for {
      teamId <- TeamMap.findTeamIdByUrlName(tag)
      team <- competitionsService.findTeam(teamId)
    } yield team
  }
}
