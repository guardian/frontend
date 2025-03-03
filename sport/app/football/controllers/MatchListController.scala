package football.controllers

import common.{Edition, JsonComponent}
import common._
import feed.Competitions
import football.model.DotcomRenderingFootballDataModel.toJson
import football.model.{DotcomRenderingFootballDataModel, MatchesList}
import football.model.DotcomRenderingFootballDataModelImplicits._
import implicits.Requests
import model.Cached.RevalidatableResult
import model.{ApplicationContext, CacheTime, Cached, Competition, TeamMap}

import java.time.LocalDate
import pa.FootballTeam
import play.api.mvc.{BaseController, RequestHeader, Result}
import play.twirl.api.Html

import java.time.format.DateTimeFormatter
import model.content.InteractiveAtom
import play.api.libs.ws.WSClient
import renderers.DotcomRenderingService
import services.dotcomrendering.{FootballPagePicker, LocalRender, RemoteRender}

import scala.concurrent.Future
import scala.concurrent.Future.successful

trait MatchListController extends BaseController with Requests with ImplicitControllerExecutionContext {
  def competitionsService: Competitions
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()
  val wsClient: WSClient

  protected val datePattern = DateTimeFormatter.ofPattern("yyyyMMMdd").withZone(Edition.defaultEdition.timezoneId)
  protected def createDate(year: String, month: String, day: String): LocalDate = {
    LocalDate.parse(s"$year${month.capitalize}$day", datePattern)
  }

  protected def renderMatchList(
      page: FootballPage,
      matchesList: MatchesList,
      filters: Map[String, Seq[CompetitionFilter]],
      atom: Option[InteractiveAtom] = None,
  )(implicit request: RequestHeader, context: ApplicationContext): Future[Result] = {
    FootballPagePicker.getTier(page) match {
      case RemoteRender =>
        val model = DotcomRenderingFootballDataModel(
          page = page,
          matchesList = matchesList,
          filters = filters,
        )
        if (request.isJson) {
          successful(Cached(CacheTime.Football)(JsonComponent.fromWritable(model)))
        } else
          remoteRenderer.getFootballPage(wsClient, toJson(model))

      case LocalRender =>
        successful(Cached(CacheTime.Football) {
          if (request.isJson)
            JsonComponent(
              "html" -> football.views.html.matchList.matchesComponent(matchesList),
              "next" -> Html(matchesList.nextPage.getOrElse("")),
              "previous" -> Html(matchesList.previousPage.getOrElse("")),
              "atom" -> atom.isDefined,
            )
          else
            RevalidatableResult.Ok(football.views.html.matchList.matchesPage(page, matchesList, filters, atom))
        })
    }
  }

  protected def renderMoreMatches(
      page: FootballPage,
      matchesList: MatchesList,
      filters: Map[String, Seq[CompetitionFilter]],
      atom: Option[InteractiveAtom] = None,
  )(implicit request: RequestHeader, context: ApplicationContext) = {
    FootballPagePicker.getTier(page) match {
      case RemoteRender =>
        val model = DotcomRenderingFootballDataModel(
          page = page,
          matchesList = matchesList,
          filters = filters,
        )
        if (request.isJson) {
          successful(Cached(CacheTime.Football)(JsonComponent.fromWritable(model)))
        } else
          remoteRenderer.getFootballPage(wsClient, toJson(model))

      case LocalRender =>
        successful(Cached(CacheTime.Football) {
          if (request.isJson) {
            JsonComponent(
              "html" -> football.views.html.matchList.moreMatchesComponent(matchesList),
              "next" -> Html(matchesList.nextPage.getOrElse("")),
              "previous" -> Html(matchesList.previousPage.getOrElse("")),
            )
          } else
            RevalidatableResult.Ok(football.views.html.matchList.matchesPage(page, matchesList, filters, atom))
        })
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
