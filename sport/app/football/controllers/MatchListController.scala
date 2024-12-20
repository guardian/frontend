package football.controllers

import common.{Edition, JsonComponent}
import feed.Competitions
import football.model.{DotcomRenderingFootballDataModel, MatchesList}
import football.model.DotcomRenderingFootballDataModelImplicits._
import implicits.Requests
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, Competition, TeamMap}

import java.time.LocalDate
import pa.FootballTeam
import play.api.mvc.{BaseController, RequestHeader}
import play.twirl.api.Html

import java.time.format.DateTimeFormatter
import model.content.InteractiveAtom

trait MatchListController extends BaseController with Requests {
  def competitionsService: Competitions
  protected val datePattern = DateTimeFormatter.ofPattern("yyyyMMMdd").withZone(Edition.defaultEdition.timezoneId)
  protected def createDate(year: String, month: String, day: String): LocalDate = {
    LocalDate.parse(s"$year${month.capitalize}$day", datePattern)
  }

  protected def renderMatchList(
      page: FootballPage,
      matchesList: MatchesList,
      filters: Map[String, Seq[CompetitionFilter]],
      atom: Option[InteractiveAtom] = None,
  )(implicit request: RequestHeader, context: ApplicationContext) = {
    Cached(10) {
      if (request.isJson && request.forceDCR) {
        val model = DotcomRenderingFootballDataModel(
          pageTitle = matchesList.getPageTitle(Edition(request)),
          pageType = matchesList.pageType,
          matchesList = DotcomRenderingFootballDataModel.getMatchesList(matchesList.matchesGroupedByDateAndCompetition),
          nextPage = matchesList.nextPage,
          previousPage = matchesList.previousPage,
        )

        JsonComponent.fromWritable(model)
      } else if (request.isJson)
        JsonComponent(
          "html" -> football.views.html.matchList.matchesComponent(matchesList),
          "next" -> Html(matchesList.nextPage.getOrElse("")),
          "previous" -> Html(matchesList.previousPage.getOrElse("")),
          "atom" -> atom.isDefined,
        )
      else
        RevalidatableResult.Ok(football.views.html.matchList.matchesPage(page, matchesList, filters, atom))
    }
  }

  protected def renderMoreMatches(
      page: FootballPage,
      matchesList: MatchesList,
      filters: Map[String, Seq[CompetitionFilter]],
      atom: Option[InteractiveAtom] = None,
  )(implicit request: RequestHeader, context: ApplicationContext) = {
    Cached(10) {
      if (request.isJson)
        JsonComponent(
          "html" -> football.views.html.matchList.moreMatchesComponent(matchesList),
          "next" -> Html(matchesList.nextPage.getOrElse("")),
          "previous" -> Html(matchesList.previousPage.getOrElse("")),
        )
      else
        RevalidatableResult.Ok(football.views.html.matchList.matchesPage(page, matchesList, filters, atom))
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
