package football.controllers

import common.{GuLogging, ImplicitControllerExecutionContext, JsonComponent}
import football.model.{CompetitionMatchDayList, DotcomRenderingFootballSubNavDataModel}
import implicits.{HtmlFormat, JsonFormat, Requests}
import model.{ApplicationContext, CacheTime, Cached}
import org.apache.pekko.http.scaladsl.util.FastFuture.successful
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, RequestHeader, Result}
import renderers.DotcomRenderingService

import scala.concurrent.Future
class CompetitionsEmbedsController(val controllerComponents: ControllerComponents, val wsClient: WSClient)(implicit
    context: ApplicationContext,
) extends BaseController
//    with Football
    with Requests
    with GuLogging
    with ImplicitControllerExecutionContext {
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()

  def competitionSubNavEmbedJson(competitionTag: String): Action[AnyContent] =
    Action.async { implicit request =>
      renderEmbed(competitionTag)
    }
  def competitionSubNavEmbed(competitionTag: String): Action[AnyContent] =
    Action.async { implicit request =>
      renderEmbed(competitionTag)
    }

  protected def renderEmbed(
      competitionTag: String,
//      matchesList: MatchesList,
  )(implicit request: RequestHeader, context: ApplicationContext): Future[Result] = {

    request.getRequestFormat match {
      case JsonFormat =>
//        val model = DotcomRenderingFootballMatchDayDataModel(
//          competitionTag = competitionTag,
//          matchesList = matchesList,
//        )

        val model = DotcomRenderingFootballSubNavDataModel(
          pageId = s"football/$competitionTag/overview",
        )
        successful(Cached(CacheTime.Football)(JsonComponent.fromWritable(model)))
      case HtmlFormat =>
        val model = DotcomRenderingFootballSubNavDataModel(
          pageId = s"football/$competitionTag/overview",
        )
        remoteRenderer.getFootballNavEmbed(wsClient, Json.toJson(model))

      case _ => successful(NotFound)
    }
  }
}
