package football.controllers

import feed.Competitions
import model.Cached.RevalidatableResult
import org.joda.time.format.DateTimeFormat
import org.joda.time.LocalDate
import model.{TeamMap, Competition, Cached, Page}
import football.model.MatchesList
import play.api.mvc.{Controller, RequestHeader}
import common.{Edition, JsonComponent}
import play.twirl.api.Html
import implicits.Requests
import pa.FootballTeam

trait MatchListController extends Controller with Requests {
  val competitionsService: Competitions
  protected val datePattern = DateTimeFormat.forPattern("yyyyMMMdd").withZone(Edition.defaultEdition.timezone)
  protected def createDate(year: String, month: String, day: String): LocalDate =
    datePattern.parseDateTime(s"$year$month$day").toLocalDate

  protected def renderMatchList(page: Page, matchesList: MatchesList, filters: Map[String, Seq[CompetitionFilter]])(implicit request: RequestHeader) = {
    Cached(10) {
      if (request.isJson)
        JsonComponent(
          "html" -> football.views.html.matchList.matchesComponent(matchesList),
          "next" -> Html(matchesList.nextPage.getOrElse("")),
          "previous" -> Html(matchesList.previousPage.getOrElse(""))
        )
      else
        RevalidatableResult.Ok(football.views.html.matchList.matchesPage(page, matchesList, filters))
    }
  }

  protected def renderMoreMatches(page: Page, matchesList: MatchesList, filters: Map[String, Seq[CompetitionFilter]])(implicit request: RequestHeader) = {
    Cached(10) {
      if(request.isJson)
        JsonComponent(
          "html" -> football.views.html.matchList.moreMatchesComponent(matchesList),
          "next" -> Html(matchesList.nextPage.getOrElse("")),
          "previous" -> Html(matchesList.previousPage.getOrElse(""))
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
