package football.controllers

import feed.Competitions
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateMidnight
import model.{TeamMap, Competition, Cached, Page}
import football.model.MatchesList
import play.api.mvc.{Controller, RequestHeader}
import common.{Edition, JsonComponent}
import play.api.templates.Html
import implicits.Requests
import pa.FootballTeam

trait MatchListController extends Controller with Requests {
  protected val datePattern = DateTimeFormat.forPattern("yyyyMMMdd").withZone(Edition.defaultEdition.timezone)
  protected def createDate(year: String, month: String, day: String): DateMidnight =
    datePattern.parseDateTime(s"$year$month$day").toDateMidnight

  protected def renderMatchList(page: Page, matchesList: MatchesList, filters: Map[String, Seq[CompetitionFilter]])(implicit request: RequestHeader) = {
    Cached(10) {
      if (request.isJson)
        JsonComponent(
          "html" -> football.views.html.matchList.matchesComponent(matchesList),
          "next" -> Html(matchesList.nextPage.getOrElse("")),
          "previous" -> Html(matchesList.previousPage.getOrElse(""))
        )
      else
        Ok(football.views.html.matchList.matchesPage(page, matchesList, filters))
    }
  }

  protected def lookupCompetition(tag: String): Option[Competition] = {
    Competitions().withTag(tag).orElse(Competitions().withId(tag))
  }
  protected def lookupTeam(tag: String): Option[FootballTeam] = {
    for {
      teamId <- TeamMap.findTeamIdByUrlName(tag)
      team <- Competitions().findTeam(teamId)
    } yield team
  }
}
